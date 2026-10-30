import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.core.config import settings, UPLOADS_DIR, BASE_DIR
from backend.app.database.db import engine, Base, SessionLocal
from backend.app.database.models import UserProfile, AnalysisHistory

# Create database tables immediately
Base.metadata.create_all(bind=engine)
from backend.app.routers import (
    food_router,
    nutrition_router,
    freshness_router,
    hygiene_router,
    cooking_router,
    meal_plan_router,
    history_router,
    settings_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default user profile if empty
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).first()
        if not profile:
            default_profile = UserProfile(
                username="Culinary Explorer",
                age=26,
                daily_calorie_target=2100,
                dietary_preference="vegetarian",
                fitness_goal="general_wellness",
                allergies=["peanuts"],
                meal_budget="medium"
            )
            db.add(default_profile)
            db.commit()

        # Seed initial sample history record if completely empty
        hist_count = db.query(AnalysisHistory).count()
        if hist_count == 0:
            demo_analysis = AnalysisHistory(
                analysis_type="nutrition",
                title="Nutrition: Palak Paneer (Spinach Cottage Cheese) (200g)",
                summary="336 kcal | Protein: 17.0g | Carbs: 10.4g | Fat: 25.6g | Health Score: 85/100",
                confidence=85.0,
                image_url=None,
                data={
                    "food_name": "Palak Paneer",
                    "portion_grams": 200.0,
                    "calories": 336.0,
                    "protein_g": 17.0,
                    "carbs_g": 10.4,
                    "fat_g": 25.6,
                    "fiber_g": 5.2,
                    "sugar_g": 3.4,
                    "sodium_mg": 560.0,
                    "health_score": {
                        "score": 85,
                        "rating": "Excellent (Super Nutritious)",
                        "positives": ["High calcium and dietary fiber", "Dense vegetarian protein"],
                        "warnings": ["Moderate sodium level"],
                        "transparency_notes": "Calibrated against USDA standard references."
                    },
                    "dietary_tags": ["Vegetarian", "High-Protein", "Gluten-Free"],
                    "data_source": "USDA Calibrated Database"
                }
            )
            db.add(demo_analysis)
            db.commit()
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Food Verse AI – Multimodal Food Intelligence Agent API combining CV food recognition, nutrition analysis, produce freshness, kitchen hygiene monitoring, AI cooking assistance, and personalized meal planning.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Health check
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_connected": bool(settings.GEMINI_API_KEY),
        "usda_connected": bool(settings.USDA_API_KEY)
    }

# Include routers
app.include_router(food_router.router, prefix=settings.API_PREFIX)
app.include_router(nutrition_router.router, prefix=settings.API_PREFIX)
app.include_router(freshness_router.router, prefix=settings.API_PREFIX)
app.include_router(hygiene_router.router, prefix=settings.API_PREFIX)
app.include_router(cooking_router.router, prefix=settings.API_PREFIX)
app.include_router(meal_plan_router.router, prefix=settings.API_PREFIX)
app.include_router(history_router.router, prefix=settings.API_PREFIX)
app.include_router(settings_router.router, prefix=settings.API_PREFIX)

from fastapi.responses import FileResponse

# Mount built frontend SPA static files if available (single combined server mode)
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Don't intercept API or upload routes
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404, detail="Resource not found")
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")

