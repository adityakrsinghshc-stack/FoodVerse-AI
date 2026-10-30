from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.schemas.history_schemas import HistoryListResponse, HistoryItemResponse
from backend.app.database.db import get_db
from backend.app.database.models import AnalysisHistory

router = APIRouter(prefix="/history", tags=["Analysis History"])

@router.get("", response_model=HistoryListResponse)
def list_history(
    analysis_type: Optional[str] = Query(None, description="Filter by type (food_recognition, nutrition, freshness, hygiene, meal_plan)"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(AnalysisHistory)
    if analysis_type and analysis_type.strip() and analysis_type != "all":
        query = query.filter(AnalysisHistory.analysis_type == analysis_type.strip())
    
    total = query.count()
    records = query.order_by(desc(AnalysisHistory.created_at)).limit(limit).all()

    items = [
        HistoryItemResponse(
            id=r.id,
            analysis_type=r.analysis_type,
            title=r.title,
            summary=r.summary,
            confidence=r.confidence,
            image_url=r.image_url,
            created_at=r.created_at,
            data=r.data
        )
        for r in records
    ]

    return HistoryListResponse(total=total, items=items)

@router.get("/{history_id}", response_model=HistoryItemResponse)
def get_history_item(
    history_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(AnalysisHistory).filter(AnalysisHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    return HistoryItemResponse(
        id=record.id,
        analysis_type=record.analysis_type,
        title=record.title,
        summary=record.summary,
        confidence=record.confidence,
        image_url=record.image_url,
        created_at=record.created_at,
        data=record.data
    )

@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(AnalysisHistory).filter(AnalysisHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Record {history_id} deleted successfully."}

@router.delete("")
def clear_all_history(
    db: Session = Depends(get_db)
):
    deleted_count = db.query(AnalysisHistory).delete()
    db.commit()
    return {"success": True, "deleted_count": deleted_count, "message": "All history records cleared."}
