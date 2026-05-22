from pydantic import BaseModel, Field
from typing import Dict, Optional

class AnalysisRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded skin image")

class QARequest(BaseModel):
    analysis_id: str
    answers: Dict[str, str] = Field(..., description="Key-value pairs of Q&A responses")

class SkinAnalysisResponse(BaseModel):
    overall_score: float
    grade: str
    acne_score: float
    scarring_score: float
    pigmentation_score: float
    open_pores_score: float
    redness_score: float
    inflammation_score: float
    puffiness_score: float
    hydration_score: float
    clinical_summary: Optional[str] = None