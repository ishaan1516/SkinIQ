import requests
from app.config import get_settings
from app.prompts.summary_prompts import SUMMARY_SYSTEM_PROMPT
from app.core.exceptions import SkinIQException

settings = get_settings()

async def generate_clinical_summary(final_scores: dict, user_answers: dict) -> str:
    """
    Sends the final scores and context to Nemotron to generate a 2-3 sentence clinical summary.
    """
    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "SkinIQ Enterprise"
        }
        
        # Combine scores and answers into a readable format for the LLM
        prompt_data = f"Final Scores:\n{final_scores}\n\nUser Context:\n{user_answers}"
        
        payload = {
            "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
            "messages": [
                {
                    "role": "system",
                    "content": SUMMARY_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt_data
                }
            ],
            "max_tokens": 150
        }
        
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        response_data = response.json()
        summary_text = response_data['choices'][0]['message']['content'].strip()
        
        return summary_text
        
    except Exception as e:
        # Fallback summary in case the LLM fails, ensuring the user still gets a result
        return "Based on your analysis, your skin is showing a consistent baseline. Please refer to your individual parameter scores for specific areas of focus."