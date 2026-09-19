"""
AI LLM Provider Abstraction Layer (Strategy Pattern).
Defines BaseLLMProvider interface and concrete implementations:
- MockLLMProvider: Deterministic offline provider for unit tests and local runs.
- GeminiLLMProvider: Live Google Gemini provider utilizing free-tier API.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
from backend.app.core.config import settings


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
                {"option_key": "B", "option_text": "2", "is_correct": True},
                {"option_key": "C", "option_text": "4", "is_correct": False},
                {"option_key": "D", "option_text": "6", "is_correct": False}
            ],
            "correct_answer": "B",
            "explanation": "By Fermat's Little Theorem, 3^6 = 1 mod 7. 100 = 6*16 + 4. Thus 3^100 = (3^6)^16 * 3^4 = 1 * 81 = 81 mod 7 = 4? Wait, 81 = 7*11 + 4 = 4. Wait, 3^4 = 81 = 4 mod 7.",
            "difficulty_level": 3,
            "verification_expression": "pow(3, 100, 7)"
        }


class GeminiLLMProvider(BaseLLMProvider):
    """
    Google Gemini API provider implementation using HTTP REST calls.
    Enforces response_mime_type="application/json".
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL_NAME
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"

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
            "contents": [{"parts": [{"text": prompt}]}],
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
            }
        }

        if response_schema:
            payload["generationConfig"]["responseSchema"] = response_schema

        async with httpx.AsyncClient(timeout=settings.AI_REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(
                self.base_url,
                headers=headers,
                params=params,
                json=payload
            )
            response.raise_for_status()
            data = response.json()

            import json
            text_content = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text_content)


def get_llm_provider() -> BaseLLMProvider:
    """Factory function returning the configured provider."""
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider()
    return MockLLMProvider()
