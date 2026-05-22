from typing import List, Dict

# A static dictionary of questions mapped to clinical parameters
QUESTION_BANK = {
    "hydration_score": {
        "id": "q_water",
        "text": "How many glasses of water do you typically drink per day?",
        "options": ["Less than 3", "3 to 6", "More than 6"]
    },
    "redness_score": {
        "id": "q_workout",
        "text": "Have you exercised, been in the sun, or taken a hot shower in the last hour?",
        "options": ["Yes", "No"]
    },
    "pigmentation_score": {
        "id": "q_sunscreen",
        "text": "How often do you apply sunscreen when going outside?",
        "options": ["Rarely/Never", "Sometimes", "Every day"]
    },
    "acne_score": {
        "id": "q_stress",
        "text": "How would you rate your current stress levels or sleep quality?",
        "options": ["High stress / Poor sleep", "Average", "Low stress / Good sleep"]
    },
    "puffiness_score": {
        "id": "q_salt_alcohol",
        "text": "Did you consume alcohol or a high-sodium meal last night?",
        "options": ["Yes", "No"]
    }
}

def generate_questions(analysis_scores: dict, max_questions: int = 3) -> List[Dict]:
    """
    Identifies the lowest scores and returns relevant questions to provide context.
    """
    # Filter out overall_score and grade, keep only the 8 clinical parameters
    parameters = {k: v for k, v in analysis_scores.items() if k.endswith("_score")}
    
    # Sort parameters by score, ascending (lowest scores first)
    sorted_params = sorted(parameters.items(), key=lambda item: item[1])
    
    selected_questions = []
    
    # Pick questions for the lowest scoring parameters
    for param_name, score in sorted_params:
        if param_name in QUESTION_BANK:
            selected_questions.append(QUESTION_BANK[param_name])
            if len(selected_questions) >= max_questions:
                break
                
    return selected_questions