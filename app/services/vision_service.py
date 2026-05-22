import json
import requests
from app.config import get_settings
from app.core.exceptions import VisionAPIException

settings = get_settings()

async def analyze_image_with_model(image_base64: str, skill_content: str) -> dict:
    """
    Sends the base64 image to NVIDIA Nemotron via OpenRouter API and returns parsed JSON.
    """
    try:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173", # Standard for OpenRouter
            "X-Title": "SkinIQ Enterprise"           # Standard for OpenRouter
        }
        
        payload = {
            "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
            "messages": [
                {
                    "role": "system",
                    "content": skill_content
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this skin image following the clinical protocol. Return ONLY valid JSON matching the output format specified. Do not include markdown formatting or explanations."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=45
        )
        response.raise_for_status()
        
        # Extract text from OpenRouter's response
        response_data = response.json()
        response_text = response_data['choices'][0]['message']['content']
        
        # Aggressive JSON extraction: grab everything between the first { and last }
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        
        if start_idx == -1 or end_idx == -1:
             raise VisionAPIException("Model failed to return a JSON object.")
             
        clean_json = response_text[start_idx:end_idx+1]
        return json.loads(clean_json)
        
    except requests.exceptions.RequestException as e:
        raise VisionAPIException(f"OpenRouter API Error: {str(e)}")
    except json.JSONDecodeError:
        raise VisionAPIException("Model returned malformed JSON.")
    except Exception as e:
        raise VisionAPIException(f"An unexpected error occurred: {str(e)}")