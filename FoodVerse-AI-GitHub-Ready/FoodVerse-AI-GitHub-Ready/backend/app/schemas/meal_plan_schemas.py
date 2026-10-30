from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class MealPlanRequest(BaseModel):
    age: Optional[int] = 28
    dietary_preference: str = "vegetarian"  # "vegetarian", "vegan", "eggetarian", "non-vegetarian"
    goal: str = "general_wellness"  # "general_wellness", "weight_management", "muscle_gain"
    allergies: Optional[List[str]] = []
    excluded_ingredients: Optional[List[str]] = []
    food_preferences: Optional[List[str]] = []
    daily_budget_tier: Optional[str] = "medium"  # "budget", "medium", "premium"
    available_ingredients: Optional[List[str]] = []
    meals_per_day: int = Field(default=4, ge=3, le=4)
    duration: str = "daily"  # "daily" or "weekly"
    calorie_target: Optional[int] = None

class MealDish(BaseModel):
    name: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    ingredients: List[str]
    prep_instructions: str
    estimated_cost_usd: float

class DailyMealPlan(BaseModel):
    day: str  # "Day 1" or "Monday"
    breakfast: MealDish
    lunch: MealDish
    evening_snack: Optional[MealDish] = None
    dinner: MealDish
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    approximate_daily_cost: float

class ShoppingCategory(BaseModel):
    category: str
    items: List[str]

class MealPlanResponse(BaseModel):
    plan_id: Optional[int] = None
    title: str
    dietary_preference: str
    goal: str
    duration: str
    days: List[DailyMealPlan]
    consolidated_shopping_list: List[ShoppingCategory]
    average_daily_calories: float
    estimated_total_cost: float
    nutrition_estimate_disclaimer: str
    saved: bool = False
