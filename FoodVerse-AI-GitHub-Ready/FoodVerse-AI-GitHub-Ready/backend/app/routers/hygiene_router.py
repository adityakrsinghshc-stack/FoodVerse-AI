import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.app.schemas.hygiene_schemas import HygieneReportResponse
from backend.app.services.hygiene_service import hygiene_service
from backend.app.core.config import settings, UPLOADS_DIR
from backend.app.database.db import get_db
from backend.app.database.models import AnalysisHistory

router = APIRouter(prefix="/hygiene", tags=["Hygiene Monitor"])

@router.post("/analyze", response_model=HygieneReportResponse)
async def analyze_hygiene(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{file_ext}'. Allowed formats: {', '.join(settings.ALLOWED_VIDEO_EXTENSIONS)}"
        )

    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_VIDEO_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Video size ({round(file_size_mb, 1)}MB) exceeds limit of {settings.MAX_VIDEO_SIZE_MB}MB."
        )

    safe_filename = f"hygiene_{uuid.uuid4().hex[:12]}{file_ext}"
    saved_path = UPLOADS_DIR / safe_filename
    with open(saved_path, "wb") as f:
        f.write(content)

    try:
        response = hygiene_service.analyze_video(saved_path)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hygiene processing error: {str(e)}")

    try:
        history_entry = AnalysisHistory(
            analysis_type="hygiene",
            title=f"Hygiene Audit: {file.filename} ({response.risk_level})",
            summary=f"Score: {response.overall_hygiene_score}/100. Hair coverage: {response.hair_covering_compliance_pct}%. Gloves: {response.glove_compliance_pct}%. Cleanliness: {response.surface_cleanliness_pct}%.",
            confidence=float(response.overall_hygiene_score),
            image_url=None,
            data=response.model_dump()
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"[DB Warning] History save failed: {e}")

    return response
