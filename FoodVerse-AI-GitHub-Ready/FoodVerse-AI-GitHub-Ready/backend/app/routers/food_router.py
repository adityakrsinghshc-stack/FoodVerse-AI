import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.app.schemas.food_schemas import FoodRecognitionResponse
from backend.app.services.food_recognition_service import food_recognition_service
from backend.app.core.config import settings, UPLOADS_DIR
from backend.app.database.db import get_db
from backend.app.database.models import AnalysisHistory

router = APIRouter(prefix="/food", tags=["Food Recognition"])

@router.post("/recognize", response_model=FoodRecognitionResponse)
async def recognize_food(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # Read content and validate size
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Image size ({round(file_size_mb, 1)}MB) exceeds limit of {settings.MAX_IMAGE_SIZE_MB}MB."
        )

    # Generate safe unique filename
    safe_filename = f"food_{uuid.uuid4().hex[:12]}{file_ext}"
    saved_path = UPLOADS_DIR / safe_filename
    with open(saved_path, "wb") as f:
        f.write(content)

    # Analyze image
    try:
        response = food_recognition_service.analyze_image(saved_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis error: {str(e)}")

    # Persist to database history
    try:
        history_entry = AnalysisHistory(
            analysis_type="food_recognition",
            title=f"Recognized: {response.primary_prediction.food_name}",
            summary=f"Detected {response.primary_prediction.food_name} with {response.primary_prediction.confidence}% confidence.",
            confidence=response.primary_prediction.confidence,
            image_url=response.image_url,
            data=response.model_dump()
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"[DB Warning] History save failed: {e}")

    return response
