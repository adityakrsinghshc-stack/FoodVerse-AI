import os
import sys
from pathlib import Path
from io import BytesIO
from PIL import Image

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.app.schemas.nutrition_schemas import NutritionRequest
from backend.app.routers.nutrition_router import analyze_nutrition
from backend.app.routers.cooking_router import cooking_chat
from backend.app.schemas.cooking_schemas import CookingChatRequest
from backend.app.routers.meal_plan_router import generate_meal_plan
from backend.app.schemas.meal_plan_schemas import MealPlanRequest
from backend.app.routers.history_router import list_history
from backend.app.routers.settings_router import get_user_settings, update_user_settings
from backend.app.schemas.settings_schemas import SettingsUpdateRequest
from backend.app.database.db import SessionLocal
from backend.app.services.food_recognition_service import food_recognition_service
from backend.app.services.freshness_service import freshness_service
from backend.app.services.hygiene_service import hygiene_service
from backend.app.core.config import UPLOADS_DIR

def create_sample_image(filename="sample_test_food.jpg", color=(220, 60, 40)):
    img_path = UPLOADS_DIR / filename
    img = Image.new("RGB", (120, 120), color=color)
    img.save(img_path, "JPEG")
    return img_path

def test_nutrition_service():
    db = SessionLocal()
    try:
        req = NutritionRequest(food_name="banana", portion_grams=150.0, save_to_history=True)
        res = analyze_nutrition(req, db=db)
        assert res.food_name is not None
        assert res.portion_grams == 150.0
        assert res.calories > 100.0
        assert res.health_score.score > 0
        print("PASS: Nutrition Analyzer & Portion Adjuster")
    finally:
        db.close()

def test_food_recognition_service():
    img_path = create_sample_image("test_red_apple.jpg", color=(210, 40, 30))
    res = food_recognition_service.analyze_image(img_path)
    assert res.success is True
    assert res.primary_prediction.confidence > 0
    assert len(res.candidate_predictions) > 0
    print(f"PASS: Food Recognition (Identified: {res.primary_prediction.food_name} [{res.primary_prediction.confidence}%])")

def test_freshness_service():
    img_path = create_sample_image("test_fresh_produce.jpg", color=(40, 180, 60))
    res = freshness_service.analyze_produce(img_path, "spinach")
    assert res.success is True
    assert res.freshness_status in ["Fresh", "Moderately Fresh", "Possibly Spoiled"]
    assert 0 <= res.freshness_score <= 100
    assert len(res.storage_suggestions) > 0
    print(f"PASS: Freshness Checker (Status: {res.freshness_status}, Score: {res.freshness_score}/100)")

def test_cooking_chat():
    req = CookingChatRequest(
        message="What can I cook with potatoes, tomatoes, and onions?",
        available_ingredients=["potatoes", "tomatoes", "onions"],
        dietary_preference="vegetarian"
    )
    res = cooking_chat(req)
    assert len(res.recipes) > 0
    r = res.recipes[0]
    assert len(r.ingredients) > 0
    assert len(r.instructions) > 0
    print(f"PASS: AI Cooking Assistant (Recipe: '{r.title}', Mode: {res.mode})")

def test_meal_plan_generation():
    db = SessionLocal()
    try:
        req = MealPlanRequest(
            age=25,
            dietary_preference="vegetarian",
            goal="general_wellness",
            allergies=["peanuts"],
            meals_per_day=4,
            duration="daily"
        )
        res = generate_meal_plan(req, db=db)
        assert len(res.days) == 1
        day = res.days[0]
        assert day.breakfast is not None
        assert day.lunch is not None
        assert day.dinner is not None
        assert day.total_calories > 1000
        assert len(res.consolidated_shopping_list) > 0
        print(f"PASS: Personalized Meal Planner (Daily Total: {day.total_calories} kcal, Budget: ${res.estimated_total_cost})")
    finally:
        db.close()

def test_hygiene_service():
    import cv2
    import numpy as np

    # Generate a brief 3-frame 320x320 synthetic video in uploads dir
    video_path = UPLOADS_DIR / "test_kitchen_clip.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(video_path), fourcc, 10.0, (320, 320))
    for i in range(15):
        frame = np.full((320, 320, 3), (180, 200, 210), dtype=np.uint8)
        # Draw a simulated counter surface
        cv2.rectangle(frame, (20, 200), (300, 310), (100, 110, 120), -1)
        out.write(frame)
    out.release()

    res = hygiene_service.analyze_video(video_path)
    assert res.success is True
    assert res.overall_hygiene_score >= 0
    assert res.risk_level in ["Low Risk", "Moderate Concern", "Elevated Risk"]
    assert len(res.frame_observations) > 0
    assert len(res.corrective_actions) >= 0
    print(f"PASS: Restaurant Hygiene Video Monitor (Score: {res.overall_hygiene_score}/100, Frames: {len(res.frame_observations)})")

def test_history_and_settings():
    db = SessionLocal()
    try:
        hist = list_history(analysis_type=None, limit=10, db=db)
        assert hist.total >= 1

        settings = get_user_settings(db=db)
        assert settings.daily_calorie_target > 0

        updated = update_user_settings(SettingsUpdateRequest(daily_calorie_target=2200), db=db)
        assert updated.daily_calorie_target == 2200
        print(f"PASS: History & User Settings (Total records: {hist.total}, Calorie Target: {updated.daily_calorie_target})")
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING FOOD VERSE AI BACKEND VERIFICATION SUITE")
    print("=" * 60)
    test_nutrition_service()
    test_food_recognition_service()
    test_freshness_service()
    test_hygiene_service()
    test_cooking_chat()
    test_meal_plan_generation()
    test_history_and_settings()
    print("=" * 60)
    print("ALL 7 TEST MODULES PASSED WITH 100% SUCCESS!")
    print("=" * 60)
