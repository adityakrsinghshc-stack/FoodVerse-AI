from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class NutritionRequest(BaseModel):
    food_name: str
    portion_grams: float = Field(default=100.0, ge=1, le=5000)
    image_url: Optional[str] = None
    save_to_history: bool = True

class MacronutrientItem(BaseModel):
    name: str
    amount_g: float
    percentage_of_calories: float
    color: str

class MicronutrientItem(BaseModel):
    name: str
    amount: float
    unit: str
    daily_value_pct: Optional[float] = None

class HealthScoreBreakdown(BaseModel):
    score: int  # 0-100
    rating: str  # Excellent, Good, Moderate, Needs Attention
    positives: List[str]
    warnings: List[str]
    transparency_notes: str

class NutritionResponse(BaseModel):
    food_name: str
    portion_grams: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: float
    macronutrients: List[MacronutrientItem]
    micronutrients: List[MicronutrientItem]
    health_score: HealthScoreBreakdown
    data_source: str
    is_estimate: bool = True
    disclaimer: str
    dietary_tags: List[str]
    image_url: Optional[str] = None
