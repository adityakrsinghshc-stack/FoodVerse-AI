from pydantic import BaseModel
from typing import List, Optional

class SettingsResponse(BaseModel):
    username: str
    age: int
    daily_calorie_target: int
    dietary_preference: str
    fitness_goal: str
    allergies: List[str]
    meal_budget: str
    gemini_key_configured: bool
    openai_key_configured: bool
    usda_key_configured: bool

class SettingsUpdateRequest(BaseModel):
    username: Optional[str] = None
    age: Optional[int] = None
    daily_calorie_target: Optional[int] = None
    dietary_preference: Optional[str] = None
    fitness_goal: Optional[str] = None
    allergies: Optional[List[str]] = None
    meal_budget: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    usda_api_key: Optional[str] = None
