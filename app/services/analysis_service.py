import uuid
import time
from typing import Dict, Optional
from app.services.image_service import process_image
from app.services.vision_service import analyze_image_with_model
from app.core.skill import load_skill_prompt
from app.services.qa_service import generate_questions
from app.services.scoring_service import apply_qa_adjustments
from app.services.summary_service import generate_clinical_summary
from app.repositories.analysis_repository import AnalysisRepository
from app.core.exceptions import SkinIQException
from fastapi import UploadFile

# Simple in-memory cache for base_scores between image upload and Q&A submission
# Key: analysis_id, Value: {base_scores, timestamp}
# TTL: 30 minutes
ANALYSIS_CACHE: Dict[str, Dict] = {}
CACHE_TTL = 30 * 60

analysis_repo = AnalysisRepository()


def _cleanup_expired_cache():
    """Remove expired entries from cache."""
    current_time = time.time()
    expired_ids = [
        aid for aid, data in ANALYSIS_CACHE.items()
        if current_time - data["timestamp"] > CACHE_TTL
    ]
    for aid in expired_ids:
        del ANALYSIS_CACHE[aid]


async def analyze_image_step(file: UploadFile) -> dict:
    """
    Step 1: Upload image, validate, analyze with Claude/Nemotron, generate questions.
    Returns analysis_id (for next step) + base_scores + selected questions.
    """
    try:
        # Process image: validate, resize, base64 encode (memory only)
        image_base64 = await process_image(file)

        # Load the SKILL system prompt
        skill_prompt = load_skill_prompt()

        # Call vision API to get base parameter scores
        base_scores = await analyze_image_with_model(image_base64, skill_prompt)

        # Generate contextual questions based on low-scoring parameters
        questions = generate_questions(base_scores)

        # Create a temporary analysis ID and cache the base_scores
        analysis_id = str(uuid.uuid4())
        _cleanup_expired_cache()
        ANALYSIS_CACHE[analysis_id] = {
            "base_scores": base_scores,
            "timestamp": time.time()
        }

        return {
            "status": "success",
            "analysis_id": analysis_id,
            "base_scores": base_scores,
            "questions": questions
        }

    except Exception as e:
        raise SkinIQException(status_code=500, detail=f"Image analysis failed: {str(e)}")


async def submit_qa_step(analysis_id: str, qa_responses: dict, user_id: str) -> dict:
    """
    Step 2: Retrieve cached base_scores, apply Q&A adjustments, generate summary, save to DB.
    Returns final scores, summary, and persisted analysis record.
    """
    try:
        # Retrieve cached base_scores from memory
        if analysis_id not in ANALYSIS_CACHE:
            raise SkinIQException(
                status_code=400,
                detail="Analysis session expired. Please upload a new image."
            )

        cached_data = ANALYSIS_CACHE[analysis_id]
        base_scores = cached_data["base_scores"]

        # Apply Q&A-based adjustments to the image scores
        final_scores = apply_qa_adjustments(base_scores, qa_responses)

        # Generate clinical summary based on final scores and user context
        summary = await generate_clinical_summary(final_scores, qa_responses)

        # Persist the complete analysis to Supabase
        saved_record = analysis_repo.create_analysis(
            user_id=user_id,
            final_scores=final_scores,
            qa_responses=qa_responses,
            summary=summary
        )

        # Clean up cache entry
        del ANALYSIS_CACHE[analysis_id]

        return {
            "status": "success",
            "data": saved_record
        }

    except SkinIQException:
        raise
    except Exception as e:
        raise SkinIQException(status_code=500, detail=f"Q&A submission failed: {str(e)}")


def get_cached_analysis(analysis_id: str) -> Optional[dict]:
    """
    Helper to retrieve a cached analysis (for debugging/testing).
    """
    _cleanup_expired_cache()
    return ANALYSIS_CACHE.get(analysis_id)
