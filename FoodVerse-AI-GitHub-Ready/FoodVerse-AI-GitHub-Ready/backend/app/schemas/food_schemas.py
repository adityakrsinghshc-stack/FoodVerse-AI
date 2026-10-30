from pydantic import BaseModel
from typing import List, Optional

class FoodPredictionItem(BaseModel):
    food_name: str
    confidence: float
    category: str
    serving_description: str
    notes: Optional[str] = None

class FoodRecognitionResponse(BaseModel):
    success: bool
    primary_prediction: FoodPredictionItem
    candidate_predictions: List[FoodPredictionItem]
    image_url: str
    model_name: str
    processing_time_sec: float
    is_uncertain: bool
    uncertainty_message: Optional[str] = None
    color_profile: Optional[dict] = None
