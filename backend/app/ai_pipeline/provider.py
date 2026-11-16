"""
AI LLM Provider Abstraction Layer (Strategy Pattern).
Defines BaseLLMProvider interface and concrete implementations:
- MockLLMProvider: Deterministic offline provider for unit tests and local runs.
- GeminiLLMProvider: Resilient Google Gemini provider with model fallback, retries,
  exponential backoff, and JSON response sanitization.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import asyncio
import json
import re
import logging
import httpx
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Preferred models in order of priority (resilience against 503 high demand spikes and timeouts)
FALLBACK_MODELS = [
    "gemini-3-flash-preview",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
]


class BaseLLMProvider(ABC):
    """Abstract Strategy interface for LLM providers."""

    @abstractmethod
    async def generate_structured_json(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Sends a generation request and returns a parsed JSON dictionary.
        """
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Offline deterministic mock provider.
    Returns pre-formulated, high-quality CAT questions for testing without network or API costs.
    """

    def __init__(self, custom_payload: Optional[Dict[str, Any]] = None):
        self.custom_payload = custom_payload

    async def generate_structured_json(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if self.custom_payload is not None:
            return self.custom_payload

        # Default QA question (Fermat's Little Theorem / Remainder)
        return {
            "section_code": "QA",
            "topic_code": "QA-NUM",
            "subtopic_code": "QA-NUM-REMAINDERS",
            "question_type": "MCQ",
            "question_text": "What is the remainder when 3^100 is divided by 7?",
            "options": [
                {"option_key": "A", "option_text": "1", "is_correct": False},
                {"option_key": "B", "option_text": "2", "is_correct": False},
                {"option_key": "C", "option_text": "4", "is_correct": True},
                {"option_key": "D", "option_text": "6", "is_correct": False}
            ],
            "correct_answer": "C",
            "explanation": "By Fermat's Little Theorem, 3^6 = 1 mod 7. 100 = 6*16 + 4. Thus 3^100 = (3^6)^16 * 3^4 = 1 * 81 = 81 mod 7 = 4.",
            "difficulty_level": 3,
            "verification_expression": "pow(3, 100, 7)"
        }


class GeminiLLMProvider(BaseLLMProvider):
    """
    Google Gemini API provider implementation with:
    - Automatic failover across compatible Gemini models
    - Exponential backoff retry logic (up to settings.AI_MAX_RETRIES)
    - Strict JSON output parsing with markdown codeblock stripping
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        # If user configured a specific model, prioritize it; otherwise start with preferred
        initial_model = model_name or settings.GEMINI_MODEL_NAME
        self.models_to_try: List[str] = [initial_model]
        for m in FALLBACK_MODELS:
            if m not in self.models_to_try:
                self.models_to_try.append(m)

    def _clean_json_text(self, raw_text: str) -> str:
        """Strip markdown fences ```json ... ``` and leading/trailing whitespace."""
        text = raw_text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return text

    async def generate_structured_json(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured in settings or environment.")

        headers = {"Content-Type": "application/json"}
        params = {"key": self.api_key}

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
            }
        }

        if response_schema:
            payload["generationConfig"]["responseSchema"] = response_schema

        last_exception: Optional[Exception] = None

        # Iterate through models with fallback
        for model in self.models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

            # Retry loop per model
            for attempt in range(1, settings.AI_MAX_RETRIES + 1):
                try:
                    logger.info(f"Invoking Gemini model '{model}' (attempt {attempt}/{settings.AI_MAX_RETRIES})")
                    async with httpx.AsyncClient(timeout=settings.AI_REQUEST_TIMEOUT_SECONDS) as client:
                        response = await client.post(
                            url,
                            headers=headers,
                            params=params,
                            json=payload
                        )

                        # If model has high demand (503), rate limit (429), or not found (404),
                        # immediately failover to next model in fallback list
                        if response.status_code in (503, 429, 404):
                            logger.warning(
                                f"Gemini model '{model}' returned HTTP {response.status_code} ({response.text[:80]}). "
                                f"Failing over to next available model..."
                            )
                            break

                        response.raise_for_status()
                        data = response.json()

                        candidates = data.get("candidates", [])
                        if not candidates:
                            raise ValueError(f"No candidates returned by Gemini: {data}")

                        first_candidate = candidates[0]
                        finish_reason = first_candidate.get("finishReason", "")
                        if finish_reason in ["SAFETY", "RECITATION"]:
                            raise ValueError(f"Gemini generation blocked due to finishReason={finish_reason}")

                        parts = first_candidate.get("content", {}).get("parts", [])
                        if not parts or "text" not in parts[0]:
                            raise ValueError(f"Malformed Gemini content parts: {first_candidate}")

                        raw_text = parts[0]["text"]
                        cleaned_json = self._clean_json_text(raw_text)
                        return json.loads(cleaned_json)

                except httpx.TimeoutException as timeout_err:
                    last_exception = timeout_err
                    logger.warning(f"Timeout contacting Gemini via model '{model}' after {settings.AI_REQUEST_TIMEOUT_SECONDS}s. Failing over to next model...")
                    break
                except httpx.NetworkError as net_err:
                    last_exception = net_err
                    logger.warning(f"Network error contacting Gemini via {model} ({type(net_err).__name__}: {net_err}). Attempt {attempt} failed.")
                    await asyncio.sleep(0.5 * (2 ** (attempt - 1)))
                except json.JSONDecodeError as json_err:
                    last_exception = json_err
                    logger.error(f"Failed to parse JSON from Gemini response: {json_err}")
                    # If JSON was malformed, retry may produce valid output
                    await asyncio.sleep(0.3)
                except httpx.HTTPStatusError as http_err:
                    last_exception = http_err
                    if http_err.response.status_code in [400, 401, 403]:
                        # Non-retryable client error (e.g. invalid API key)
                        raise http_err
                    break
                except Exception as ex:
                    last_exception = ex
                    break

        raise RuntimeError(
            f"All Gemini models ({self.models_to_try}) exhausted without a successful response. "
            f"Last error: {last_exception}"
        )


def get_llm_provider() -> BaseLLMProvider:
    """Factory function returning the configured provider."""
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider()
    return MockLLMProvider()
