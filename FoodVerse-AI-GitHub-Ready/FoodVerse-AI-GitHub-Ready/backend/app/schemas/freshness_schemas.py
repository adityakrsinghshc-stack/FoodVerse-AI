from pydantic import BaseModel
from typing import List, Optional, Dict

class FreshnessIndicator(BaseModel):
    name: str
    observed_value: str
    status: str  # optimal, caution, degraded
    description: str

class StorageTip(BaseModel):
    environment: str  # Room temp, Refrigerated, Frozen
    duration: str
    tip: str

class FreshnessResponse(BaseModel):
    success: bool
    food_category: str
    freshness_status: str  # "Fresh", "Moderately Fresh", "Possibly Spoiled"
    freshness_score: int  # 0 - 100
    confidence: float
    model_mode: str  # "Computer Vision Visual Assessment (OpenCV Color/Texture Pipeline)"
    image_url: str
    visible_indicators: List[FreshnessIndicator]
    storage_suggestions: List[StorageTip]
    visual_metrics: Dict[str, float]  # browning_pct, greenness_index, texture_entropy
    safety_advisory: str
    is_uncertain: bool
    disclaimer: str
