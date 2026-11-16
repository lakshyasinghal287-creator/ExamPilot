"""
Prompt Builder for CAT AI Question Generation.
Constructs rigorously structured prompts for Google Gemini to guarantee schema compliance.
"""

from typing import Optional


def build_cat_question_prompt(
    section_code: str,
    topic_name: Optional[str] = None,
    subtopic_code: Optional[str] = None,
    difficulty_level: int = 3,
    question_type: str = "MCQ"
) -> tuple[str, str]:
    """
    Returns (prompt, system_instruction) tailored to the CAT section and topic.
    """
    system_instruction = (
        "You are a distinguished Indian Institute of Management (IIM) faculty member and Chief Paper Setter "
        "for the Common Admission Test (CAT). You create questions that strictly test higher-order reasoning, "
        "analytical depth, and conceptual precision. Output ONLY valid JSON matching the exact schema."
    )

    section_code = section_code.upper()
    q_type = question_type.upper()

    if section_code == "QA":
        prompt = f"""Generate a high-yield CAT Quantitative Ability (QA) question.
Topic: {topic_name or 'Arithmetic or Algebra or Number Systems'}
Subtopic Code: {subtopic_code or 'QA-NUM-REMAINDERS'}
Question Type: {q_type}
Difficulty Level: {difficulty_level} (scale 1 to 5, where 3 is standard CAT difficulty)

CRITICAL REQUIREMENTS FOR QA:
1. Provide a rigorous, trap-tested question.
2. In 'verification_expression', provide a pure, self-contained Python/SymPy expression that computes the exact numerical or algebraic answer.
   - Example 1: "pow(3, 100, 7)"
   - Example 2: "solve(Eq(x**2 - 5*x + 6, 0), x)[1]"
   - Example 3: "(120 * 4) / 6"
3. For MCQ: Provide 4 options (A, B, C, D) where exactly one is correct. The correct option's option_text must evaluate to or match the verification_expression result.
4. Provide a step-by-step logical explanation.

JSON Schema format to follow:
{{
  "section_code": "QA",
  "topic_code": "QA-GEN",
  "subtopic_code": "{subtopic_code or 'QA-NUM-REMAINDERS'}",
  "question_type": "{q_type}",
  "question_text": "<Clear, concise question statement>",
  "options": [
    {{"option_key": "A", "option_text": "<value>", "is_correct": false}},
    {{"option_key": "B", "option_text": "<value>", "is_correct": true}},
    {{"option_key": "C", "option_text": "<value>", "is_correct": false}},
    {{"option_key": "D", "option_text": "<value>", "is_correct": false}}
  ],
  "correct_answer": "B",
  "explanation": "<Step-by-step mathematical reasoning>",
  "difficulty_level": {difficulty_level},
  "verification_expression": "<Python/SymPy expression evaluating to the correct answer>"
}}
"""
    elif section_code == "VARC":
        prompt = f"""Generate a high-caliber CAT Verbal Ability and Reading Comprehension (VARC) question.
Topic: {topic_name or 'Critical Reasoning or Para-Summary or Para-Jumbles'}
Subtopic Code: {subtopic_code or 'VARC-CR'}
Question Type: {q_type}
Difficulty Level: {difficulty_level} (scale 1 to 5)

CRITICAL REQUIREMENTS FOR VARC:
1. Include a short thought-provoking passage (120-200 words) in 'question_text' followed by the analytical question.
2. For MCQ: Provide 4 nuanced options with classic CAT distractors (too narrow, extreme, out of scope).
3. The explanation must analyze why the chosen answer is superior to the subtle trap options.

JSON Schema format to follow:
{{
  "section_code": "VARC",
  "topic_code": "VARC-RC",
  "subtopic_code": "{subtopic_code or 'VARC-CR'}",
  "question_type": "{q_type}",
  "question_text": "<Passage>\\n\\n<Question statement>",
  "options": [
    {{"option_key": "A", "option_text": "<option text>", "is_correct": false}},
    {{"option_key": "B", "option_text": "<option text>", "is_correct": true}},
    {{"option_key": "C", "option_text": "<option text>", "is_correct": false}},
    {{"option_key": "D", "option_text": "<option text>", "is_correct": false}}
  ],
  "correct_answer": "B",
  "explanation": "<Nuanced textual justification>",
  "difficulty_level": {difficulty_level},
  "verification_expression": null
}}
"""
    else:  # DILR
        prompt = f"""Generate a high-caliber CAT Data Interpretation & Logical Reasoning (DILR) question.
Topic: {topic_name or 'Arrangements or Matrix Grid or Caselet'}
Subtopic Code: {subtopic_code or 'DILR-LR-ARRANGE'}
Question Type: {q_type}
Difficulty Level: {difficulty_level} (scale 1 to 5)

CRITICAL REQUIREMENTS FOR DILR:
1. Include a concise puzzle or data scenario in 'question_text' with well-defined constraints.
2. Formulate a specific question based on deductions from that scenario.
3. For MCQ: Provide 4 plausible options.
4. Detailed explanation showing the deduction table or logical chain.

JSON Schema format to follow:
{{
  "section_code": "DILR",
  "topic_code": "DILR-LR",
  "subtopic_code": "{subtopic_code or 'DILR-LR-ARRANGE'}",
  "question_type": "{q_type}",
  "question_text": "<Scenario/Constraints>\\n\\n<Question>",
  "options": [
    {{"option_key": "A", "option_text": "<option text>", "is_correct": false}},
    {{"option_key": "B", "option_text": "<option text>", "is_correct": true}},
    {{"option_key": "C", "option_text": "<option text>", "is_correct": false}},
    {{"option_key": "D", "option_text": "<option text>", "is_correct": false}}
  ],
  "correct_answer": "B",
  "explanation": "<Deduction steps and constraint satisfaction>",
  "difficulty_level": {difficulty_level},
  "verification_expression": null
}}
"""

    return prompt, system_instruction
