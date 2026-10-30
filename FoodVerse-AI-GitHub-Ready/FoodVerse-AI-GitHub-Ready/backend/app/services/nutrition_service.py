import json
from pathlib import Path
from typing import Optional, Dict, Any
import requests

from backend.app.schemas.nutrition_schemas import (
    NutritionResponse,
    MacronutrientItem,
    MicronutrientItem,
    HealthScoreBreakdown
)
from backend.app.core.config import settings

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "usda_nutrition_db.json"

class NutritionService:
    def __init__(self):
        self._load_db()

    def _load_db(self):
        if DATA_PATH.exists():
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                self.db = json.load(f)
        else:
            self.db = {}

    def _find_item(self, query: str) -> Optional[Dict[str, Any]]:
        query_clean = query.lower().strip()
        # Direct key match
        if query_clean in self.db:
            return self.db[query_clean]
        
        # Substring / name match
        for key, item in self.db.items():
            if query_clean in key or key in query_clean:
                return item
            if query_clean in item.get("name", "").lower():
                return item
                
        # Word token matching
        tokens = query_clean.split()
        for key, item in self.db.items():
            if any(t in key for t in tokens):
                return item

        # Fallback to general apple/salad if nothing matched
        return list(self.db.values())[0] if self.db else None

    def calculate_health_score(self, item: Dict[str, Any], calories_100g: float, protein_g: float, carbs_g: float, fat_g: float, fiber_g: float, sugar_g: float, sodium_mg: float) -> HealthScoreBreakdown:
        score = 70  # Baseline
        positives = []
        warnings = []

        # Fiber benefit
        if fiber_g >= 4.0:
            score += 12
            positives.append(f"High dietary fiber ({fiber_g}g per 100g) promotes sustained satiety and gut health.")
        elif fiber_g >= 2.0:
            score += 6
            positives.append(f"Good source of dietary fiber ({fiber_g}g per 100g).")

        # Protein density
        protein_cals = protein_g * 4.0
        if calories_100g > 0 and (protein_cals / calories_100g) >= 0.25:
            score += 10
            positives.append("Excellent protein-to-calorie ratio, aiding muscle repair and metabolic rate.")
        elif protein_g >= 6.0:
            score += 5
            positives.append(f"Provides notable protein ({protein_g}g).")

        # Sugar evaluation
        if sugar_g <= 3.0:
            score += 6
            positives.append("Low simple sugar profile; minimal glycemic spike.")
        elif sugar_g >= 12.0 and "Fruits" not in item.get("category", ""):
            score -= 10
            warnings.append(f"Elevated sugar content ({sugar_g}g per 100g); consume in measured portions.")

        # Sodium evaluation
        if sodium_mg > 400.0:
            score -= 12
            warnings.append(f"Moderate to high sodium level ({sodium_mg}mg per 100g); stay mindful if monitoring blood pressure.")
        elif sodium_mg < 100.0:
            score += 5
            positives.append("Naturally very low in sodium.")

        # Caloric density
        if calories_100g > 350.0:
            warnings.append("High caloric density. Best enjoyed in measured serving sizes.")

        # Bound score between 20 and 98
        final_score = int(min(max(score, 20), 98))

        if final_score >= 85:
            rating = "Excellent (Super Nutritious)"
        elif final_score >= 70:
            rating = "Good (Balanced Choice)"
        elif final_score >= 50:
            rating = "Moderate (Acceptable in Balance)"
        else:
            rating = "Needs Attention (High Calorie / Sodium)"

        transparency = (
            f"Health Score is calculated transparently from nutrient density metrics: "
            f"+fiber bonus, +protein ratio, -high sodium penalties, and -high added sugar deductions."
        )

        return HealthScoreBreakdown(
            score=final_score,
            rating=rating,
            positives=positives if positives else ["Standard nutrient density for its food group."],
            warnings=warnings if warnings else ["No significant nutrient concerns detected."],
            transparency_notes=transparency
        )

    def analyze_food(self, food_name: str, portion_grams: float, image_url: Optional[str] = None) -> NutritionResponse:
        item = self._find_item(food_name)
        if not item:
            # Fallback default item
            item = {
                "name": food_name.title(),
                "category": "Prepared Food",
                "base_grams": 100,
                "calories": 140.0,
                "protein_g": 4.5,
                "carbs_g": 18.0,
                "fat_g": 5.0,
                "fiber_g": 2.0,
                "sugar_g": 3.0,
                "sodium_mg": 210.0,
                "micronutrients": [],
                "dietary_tags": ["General"],
                "health_notes": "Estimated baseline nutritional composition."
            }

        # Multiplier based on requested portion (standard database is per 100g)
        multiplier = portion_grams / 100.0

        calories = round(item.get("calories", 0) * multiplier, 1)
        protein_g = round(item.get("protein_g", 0) * multiplier, 1)
        carbs_g = round(item.get("carbs_g", 0) * multiplier, 1)
        fat_g = round(item.get("fat_g", 0) * multiplier, 1)
        fiber_g = round(item.get("fiber_g", 0) * multiplier, 1)
        sugar_g = round(item.get("sugar_g", 0) * multiplier, 1)
        sodium_mg = round(item.get("sodium_mg", 0) * multiplier, 1)

        # Macro caloric contributions (Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g)
        p_cals = protein_g * 4.0
        c_cals = carbs_g * 4.0
        f_cals = fat_g * 9.0
        total_macro_cals = p_cals + c_cals + f_cals or 1.0

        macros = [
            MacronutrientItem(
                name="Protein",
                amount_g=protein_g,
                percentage_of_calories=round((p_cals / total_macro_cals) * 100, 1),
                color="#10b981"  # Emerald
            ),
            MacronutrientItem(
                name="Carbohydrates",
                amount_g=carbs_g,
                percentage_of_calories=round((c_cals / total_macro_cals) * 100, 1),
                color="#f59e0b"  # Amber
            ),
            MacronutrientItem(
                name="Total Fat",
                amount_g=fat_g,
                percentage_of_calories=round((f_cals / total_macro_cals) * 100, 1),
                color="#f97316"  # Orange
            ),
        ]

        # Scaled micronutrients
        micros = []
        for m in item.get("micronutrients", []):
            scaled_amount = round(m["amount"] * multiplier, 2)
            dv_pct = round(m["daily_value_pct"] * multiplier, 1) if m.get("daily_value_pct") is not None else None
            micros.append(MicronutrientItem(
                name=m["name"],
                amount=scaled_amount,
                unit=m["unit"],
                daily_value_pct=dv_pct
            ))

        # Health score based on 100g base values
        health_breakdown = self.calculate_health_score(
            item=item,
            calories_100g=item.get("calories", 0),
            protein_g=item.get("protein_g", 0),
            carbs_g=item.get("carbs_g", 0),
            fat_g=item.get("fat_g", 0),
            fiber_g=item.get("fiber_g", 0),
            sugar_g=item.get("sugar_g", 0),
            sodium_mg=item.get("sodium_mg", 0)
        )

        data_source = "USDA FoodData Central Calibrated Reference Dataset (SR Legacy / Foundation)"
        if settings.USDA_API_KEY:
            data_source += " [Live USDA Key Available]"

        disclaimer = (
            "Notice: Calorie and macronutrient values are nutritional estimates based on USDA reference standards. "
            "Actual culinary values vary depending on ingredient brands, cooking oil absorption, and cooking techniques."
        )

        return NutritionResponse(
            food_name=item.get("name", food_name.title()),
            portion_grams=round(portion_grams, 1),
            calories=calories,
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
            fiber_g=fiber_g,
            sugar_g=sugar_g,
            sodium_mg=sodium_mg,
            macronutrients=macros,
            micronutrients=micros,
            health_score=health_breakdown,
            data_source=data_source,
            is_estimate=True,
            disclaimer=disclaimer,
            dietary_tags=item.get("dietary_tags", ["Balanced"]),
            image_url=image_url
        )

nutrition_service = NutritionService()
