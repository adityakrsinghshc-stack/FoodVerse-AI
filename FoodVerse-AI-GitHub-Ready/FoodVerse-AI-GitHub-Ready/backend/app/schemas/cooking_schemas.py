from pydantic import BaseModel, Field
from typing import List, Optional

class CookingChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class RecipeCard(BaseModel):
    title: str
    description: str
    prep_time_min: int
    cook_time_min: int
    total_time_min: int
    difficulty: str  # "Easy", "Medium", "Chef-level"
    servings: int
    calories_per_serving: Optional[int] = None
    ingredients: List[str]
    instructions: List[str]
    substitutions: List[str]
    allergen_notes: List[str]
    storage_and_handling: str
    dietary_tags: List[str]

class CookingChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[CookingChatMessage]] = []
    dietary_preference: Optional[str] = "all"
    available_ingredients: Optional[List[str]] = []

class CookingChatResponse(BaseModel):
    response_text: str
    recipes: List[RecipeCard]
    mode: str  # "Gemini LLM Connected" or "Predefined Culinary Intelligence Engine (Offline Fallback)"
    suggestions: List[str]
    detected_intent: str
