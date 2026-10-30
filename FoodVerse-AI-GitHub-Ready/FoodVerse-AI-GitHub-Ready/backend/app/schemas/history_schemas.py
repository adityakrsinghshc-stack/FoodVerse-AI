from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class HistoryItemResponse(BaseModel):
    id: int
    analysis_type: str
    title: str
    summary: Optional[str] = None
    confidence: Optional[float] = None
    image_url: Optional[str] = None
    created_at: datetime
    data: Optional[Any] = None

class HistoryListResponse(BaseModel):
    total: int
    items: List[HistoryItemResponse]
