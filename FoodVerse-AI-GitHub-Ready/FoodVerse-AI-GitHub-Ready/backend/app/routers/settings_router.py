from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.schemas.settings_schemas import SettingsResponse, SettingsUpdateRequest
from backend.app.database.db import get_db
from backend.app.database.models import UserProfile
from backend.app.core.config import settings

router = APIRouter(prefix="/settings", tags=["Settings & Profile"])

@router.get("", response_model=SettingsResponse)
def get_user_settings(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return SettingsResponse(
        username=profile.username,
        age=profile.age,
        daily_calorie_target=profile.daily_calorie_target,
        dietary_preference=profile.dietary_preference,
        fitness_goal=profile.fitness_goal,
        allergies=profile.allergies or [],
        meal_budget=profile.meal_budget,
        gemini_key_configured=bool(settings.GEMINI_API_KEY),
        openai_key_configured=bool(settings.OPENAI_API_KEY),
        usda_key_configured=bool(settings.USDA_API_KEY)
    )

@router.post("", response_model=SettingsResponse)
def update_user_settings(
    req: SettingsUpdateRequest,
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)

    if req.username is not None:
        profile.username = req.username
    if req.age is not None:
        profile.age = req.age
    if req.daily_calorie_target is not None:
        profile.daily_calorie_target = req.daily_calorie_target
    if req.dietary_preference is not None:
        profile.dietary_preference = req.dietary_preference
    if req.fitness_goal is not None:
        profile.fitness_goal = req.fitness_goal
    if req.allergies is not None:
        profile.allergies = req.allergies
    if req.meal_budget is not None:
        profile.meal_budget = req.meal_budget

    # Optional runtime keys update
    if req.gemini_api_key is not None:
        settings.GEMINI_API_KEY = req.gemini_api_key.strip()
    if req.openai_api_key is not None:
        settings.OPENAI_API_KEY = req.openai_api_key.strip()
    if req.usda_api_key is not None:
        settings.USDA_API_KEY = req.usda_api_key.strip()

    db.commit()
    db.refresh(profile)

    return SettingsResponse(
        username=profile.username,
        age=profile.age,
        daily_calorie_target=profile.daily_calorie_target,
        dietary_preference=profile.dietary_preference,
        fitness_goal=profile.fitness_goal,
        allergies=profile.allergies or [],
        meal_budget=profile.meal_budget,
        gemini_key_configured=bool(settings.GEMINI_API_KEY),
        openai_key_configured=bool(settings.OPENAI_API_KEY),
        usda_key_configured=bool(settings.USDA_API_KEY)
    )
