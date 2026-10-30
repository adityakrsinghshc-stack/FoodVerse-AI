from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.schemas.meal_plan_schemas import MealPlanRequest, MealPlanResponse
from backend.app.services.meal_plan_service import meal_plan_service
from backend.app.database.db import get_db
from backend.app.database.models import SavedMealPlan, AnalysisHistory

router = APIRouter(prefix="/meal-plan", tags=["Meal Planner"])

@router.post("/generate", response_model=MealPlanResponse)
def generate_meal_plan(
    req: MealPlanRequest,
    db: Session = Depends(get_db)
):
    try:
        response = meal_plan_service.generate_meal_plan(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Meal plan generation error: {str(e)}")

    # Save to history automatically
    try:
        history_entry = AnalysisHistory(
            analysis_type="meal_plan",
            title=response.title,
            summary=f"{response.duration.title()} plan | Avg {response.average_daily_calories} kcal/day | Estimated budget: ${response.estimated_total_cost}",
            confidence=95.0,
            image_url=None,
            data=response.model_dump()
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"[DB Warning] Meal plan history save failed: {e}")

    return response

@router.post("/save")
def save_meal_plan(
    plan_data: dict,
    db: Session = Depends(get_db)
):
    try:
        saved = SavedMealPlan(
            title=plan_data.get("title", "Saved Meal Plan"),
            plan_type=plan_data.get("duration", "daily"),
            dietary_preference=plan_data.get("dietary_preference", "vegetarian"),
            fitness_goal=plan_data.get("goal", "general_wellness"),
            total_calories=plan_data.get("average_daily_calories", 0.0),
            data=plan_data
        )
        db.add(saved)
        db.commit()
        db.refresh(saved)
        return {"success": True, "saved_id": saved.id, "message": "Meal plan saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save meal plan: {str(e)}")
