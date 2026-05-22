from fastapi import HTTPException

class SkinIQException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class VisionAPIException(SkinIQException):
    def __init__(self, detail: str = "Failed to process image with Vision API"):
        super().__init__(status_code=502, detail=detail)

class InvalidImageException(SkinIQException):
    def __init__(self, detail: str = "Invalid image format or size"):
        super().__init__(status_code=400, detail=detail)