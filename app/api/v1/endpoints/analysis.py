from fastapi import APIRouter, Depends, UploadFile, File
from app.dependencies import get_current_user
from app.services import analysis_service
from app.models.schemas import QARequest

router = APIRouter()


@router.post("/image")
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Step 1: Upload image → validate → analyze with vision API → generate questions.
    Returns analysis_id (cache key), base_scores, and contextual questions.
    """
    return await analysis_service.analyze_image_step(file)


@router.post("/qa")
async def submit_qa_endpoint(
    request: QARequest,
    current_user = Depends(get_current_user)
):
    """
    Step 2: Retrieve cached base_scores → apply Q&A adjustments → generate summary → save to DB.
    Returns final scores, summary, and persisted analysis record.
    """
    return await analysis_service.submit_qa_step(
        analysis_id=request.analysis_id,
        qa_responses=request.answers,
        user_id=current_user.id
    )