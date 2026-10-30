from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.schemas.nutrition_schemas import NutritionRequest, NutritionResponse
from backend.app.services.nutrition_service import nutrition_service
from backend.app.database.db import get_db
from backend.app.database.models import AnalysisHistory

router = APIRouter(prefix="/nutrition", tags=["Nutrition Analyzer"])

@router.post("/analyze", response_model=NutritionResponse)
def analyze_nutrition(
    req: NutritionRequest,
    db: Session = Depends(get_db)
):
    if not req.food_name or not req.food_name.strip():
        raise HTTPException(status_code=400, detail="Food name is required.")

    response = nutrition_service.analyze_food(
        food_name=req.food_name,
        portion_grams=req.portion_grams,
        image_url=req.image_url
    )

    if req.save_to_history:
        try:
            history_entry = AnalysisHistory(
                analysis_type="nutrition",
                title=f"Nutrition: {response.food_name} ({response.portion_grams}g)",
                summary=f"{response.calories} kcal | Protein: {response.protein_g}g | Carbs: {response.carbs_g}g | Fat: {response.fat_g}g | Score: {response.health_score.score}/100",
                confidence=float(response.health_score.score),
                image_url=response.image_url,
                data=response.model_dump()
            )
            db.add(history_entry)
            db.commit()
        except Exception as e:
            print(f"[DB Warning] History save failed: {e}")

    return response
