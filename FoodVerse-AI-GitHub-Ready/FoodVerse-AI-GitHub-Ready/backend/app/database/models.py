from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float
from backend.app.database.db import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_type = Column(String(50), nullable=False, index=True)  # 'food_recognition', 'nutrition', 'freshness', 'hygiene', 'meal_plan'
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    data = Column(JSON, nullable=False, default={})
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), default="Guest User")
    age = Column(Integer, default=25)
    daily_calorie_target = Column(Integer, default=2000)
    dietary_preference = Column(String(50), default="vegetarian")  # 'vegetarian', 'vegan', 'eggetarian', 'non-vegetarian'
    fitness_goal = Column(String(50), default="general_wellness")  # 'general_wellness', 'weight_management', 'muscle_gain'
    allergies = Column(JSON, default=[])  # e.g., ['peanuts', 'gluten']
    meal_budget = Column(String(50), default="medium")  # 'budget', 'medium', 'premium'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SavedMealPlan(Base):
    __tablename__ = "saved_meal_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    plan_type = Column(String(50), default="daily")  # 'daily', 'weekly'
    dietary_preference = Column(String(50))
    fitness_goal = Column(String(50))
    total_calories = Column(Float, default=0.0)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

from backend.app.database.db import engine
Base.metadata.create_all(bind=engine)

