import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.app.schemas.freshness_schemas import FreshnessResponse
from backend.app.services.freshness_service import freshness_service
from backend.app.core.config import settings, UPLOADS_DIR
from backend.app.database.db import get_db
from backend.app.database.models import AnalysisHistory

router = APIRouter(prefix="/freshness", tags=["Freshness Checker"])

@router.post("/analyze", response_model=FreshnessResponse)
async def analyze_freshness(
    file: UploadFile = File(...),
    food_category: str = Form(default="produce"),
    db: Session = Depends(get_db)
):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )

    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({round(file_size_mb, 1)}MB) exceeds limit of {settings.MAX_IMAGE_SIZE_MB}MB."
        )

    safe_filename = f"fresh_{uuid.uuid4().hex[:12]}{file_ext}"
    saved_path = UPLOADS_DIR / safe_filename
    with open(saved_path, "wb") as f:
        f.write(content)

    try:
        response = freshness_service.analyze_produce(saved_path, food_category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Freshness analysis error: {str(e)}")

    try:
        history_entry = AnalysisHistory(
            analysis_type="freshness",
            title=f"Freshness: {response.food_category} ({response.freshness_status})",
            summary=f"Freshness score: {response.freshness_score}/100. Status: {response.freshness_status}. Confidence: {response.confidence}%.",
            confidence=response.confidence,
            image_url=response.image_url,
            data=response.model_dump()
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"[DB Warning] History save failed: {e}")

    return response
