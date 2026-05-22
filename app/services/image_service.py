from PIL import Image
from fastapi import UploadFile
import io
import base64
from app.core.exceptions import InvalidImageException

async def process_image(file: UploadFile) -> str:
    """
    Reads image into memory, resizes, and base64 encodes.
    Never touches the disk for privacy compliance.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise InvalidImageException(status_code=400, detail="File must be an image (JPEG, PNG, etc.).")

    contents = await file.read()
    
    try:
        # Load image into memory
        image = Image.open(io.BytesIO(contents))
        
        # Resize to max 1024px to reduce API cost and latency
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        # Convert to RGB (handles PNGs with transparency) and save as JPEG in memory
        if image.mode in ("RGBA", "P", "LA"):
            image = image.convert("RGB")
            
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        buffer.seek(0)
        
        # Base64 encode - ready for Claude/Nemotron Vision
        return base64.b64encode(buffer.read()).decode("utf-8")
        
    except Exception as e:
        raise InvalidImageException(status_code=400, detail=f"Failed to process image: {str(e)}")