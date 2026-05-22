from typing import Dict

def get_grade(score: float) -> str:
    """Returns the grade classification based on the blueprint rubric."""
    if score >= 9.0: return "Excellent"
    if score >= 7.5: return "Good"
    if score >= 6.0: return "Fair"
    if score >= 4.0: return "Needs Attention"
    return "Concerning"

def apply_qa_adjustments(base_scores: dict, qa_answers: Dict[str, str]) -> dict:
    """
    Adjusts the initial image analysis scores based on user lifestyle answers.
    Creates a new dictionary to avoid mutating the original database record.
    """
    adjusted_scores = base_scores.copy()
    
    # --- Scoring Logic Rules ---
    
    # 1. Hydration adjustments
    if "q_water" in qa_answers:
        if qa_answers["q_water"] == "Less than 3":
            adjusted_scores["hydration_score"] = max(1.0, adjusted_scores["hydration_score"] - 1.0)
        elif qa_answers["q_water"] == "More than 6":
            adjusted_scores["hydration_score"] = min(10.0, adjusted_scores["hydration_score"] + 0.5)

    # 2. Redness adjustments (Contextual forgiveness)
    # If the face is red but they just worked out, we shouldn't penalize their baseline skin health
    if "q_workout" in qa_answers and qa_answers["q_workout"] == "Yes":
        adjusted_scores["redness_score"] = min(10.0, adjusted_scores["redness_score"] + 1.5)

    # 3. Pigmentation (Sunscreen habits)
    if "q_sunscreen" in qa_answers:
        if qa_answers["q_sunscreen"] == "Rarely/Never":
            adjusted_scores["pigmentation_score"] = max(1.0, adjusted_scores["pigmentation_score"] - 1.0)
            
    # 4. Acne (Stress/Sleep impact)
    if "q_stress" in qa_answers:
        if qa_answers["q_stress"] == "High stress / Poor sleep":
            adjusted_scores["acne_score"] = max(1.0, adjusted_scores["acne_score"] - 0.5)
            
    # 5. Puffiness (Diet impact)
    if "q_salt_alcohol" in qa_answers and qa_answers["q_salt_alcohol"] == "Yes":
        # Temporary puffiness from diet shouldn't heavily impact long-term health score
        adjusted_scores["puffiness_score"] = min(10.0, adjusted_scores["puffiness_score"] + 1.0)

    # Recalculate overall score based on the 8 adjusted parameters
    parameters = [v for k, v in adjusted_scores.items() if k.endswith("_score") and k != "overall_score"]
    
    adjusted_scores["overall_score"] = round(sum(parameters) / len(parameters), 2)
    adjusted_scores["grade"] = get_grade(adjusted_scores["overall_score"])
    
    return adjusted_scores