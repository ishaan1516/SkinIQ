from app.repositories.base import BaseRepository
from app.core.exceptions import SkinIQException

class AnalysisRepository(BaseRepository):
    def create_analysis(self, user_id: str, final_scores: dict, qa_responses: dict, summary: str) -> dict:
        """
        Inserts a new skin analysis record securely into the database.
        Row Level Security (RLS) ensures this is locked to the user_id.
        """
        try:
            # Construct the payload matching your Supabase SQL schema
            payload = {
                "user_id": user_id,
                "overall_score": final_scores.get("overall_score"),
                "grade": final_scores.get("grade"),
                "acne_score": final_scores.get("acne_score"),
                "scarring_score": final_scores.get("scarring_score"),
                "pigmentation_score": final_scores.get("pigmentation_score"),
                "open_pores_score": final_scores.get("open_pores_score"),
                "redness_score": final_scores.get("redness_score"),
                "inflammation_score": final_scores.get("inflammation_score"),
                "puffiness_score": final_scores.get("puffiness_score"),
                "hydration_score": final_scores.get("hydration_score"),
                "clinical_summary": summary,
                "qa_responses": qa_responses
            }
            
            response = self.supabase.table("analyses").insert(payload).execute()
            
            if not response.data:
                raise SkinIQException(status_code=500, detail="Failed to save analysis to database.")
                
            return response.data[0]
            
        except Exception as e:
            raise SkinIQException(status_code=500, detail=f"Database insertion error: {str(e)}")