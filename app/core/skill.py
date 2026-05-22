import os
from functools import lru_cache

@lru_cache()
def load_skill_prompt() -> str:
    """
    Loads the SKILL_skin_analysis.md file into memory.
    lru_cache ensures this disk read only happens once during the app lifecycle.
    """
    # Navigate up from app/core/skill.py to the root skiniq/ directory
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    skill_path = os.path.join(base_dir, "SKILL_skin_analysis.md")
    
    try:
        with open(skill_path, "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        raise RuntimeError(f"Critical Error: {skill_path} not found. The app cannot start without the AI system prompt.")