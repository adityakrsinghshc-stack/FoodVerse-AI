import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import requests

from backend.app.schemas.cooking_schemas import (
    CookingChatRequest,
    CookingChatResponse,
    RecipeCard
)
from backend.app.core.config import settings

RECIPES_PATH = Path(__file__).resolve().parent.parent / "data" / "culinary_recipes_db.json"

class CookingService:
    def __init__(self):
        self._load_fallback_recipes()

    def _load_fallback_recipes(self):
        if RECIPES_PATH.exists():
            with open(RECIPES_PATH, "r", encoding="utf-8") as f:
                self.recipes: List[Dict[str, Any]] = json.load(f)
        else:
            self.recipes = []

    def handle_chat(self, req: CookingChatRequest) -> CookingChatResponse:
        user_msg = req.message.lower().strip()
        
        # Check if Gemini API key is configured
        gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            try:
                return self._call_gemini_api(req, gemini_key)
            except Exception as e:
                # Fallback gracefully with clear logging
                print(f"[CookingService] Gemini API call failed: {e}. Falling back to internal culinary engine.")

        # Predefined Culinary Engine (Deterministic & Offline Fallback)
        return self._fallback_culinary_engine(req)

    def _fallback_culinary_engine(self, req: CookingChatRequest) -> CookingChatResponse:
        user_msg = req.message.lower().strip()
        matched_recipes: List[RecipeCard] = []

        # Extract potential ingredient tokens from message + req.available_ingredients
        query_words = set(user_msg.replace(",", " ").replace(".", " ").split())
        if req.available_ingredients:
            for ing in req.available_ingredients:
                query_words.add(ing.lower().strip())

        # Match recipes based on ingredient overlap or keywords
        scored_recipes = []
        for r in self.recipes:
            score = 0
            # Check dietary preference filter
            if req.dietary_preference and req.dietary_preference.lower() != "all":
                tags = [t.lower() for t in r.get("dietary_tags", [])]
                pref = req.dietary_preference.lower()
                if pref == "vegetarian" and "vegetarian" not in tags and "vegan" not in tags:
                    continue
                if pref == "vegan" and "vegan" not in tags:
                    continue

            key_ings = set(k.lower() for k in r.get("key_ingredients", []))
            overlap = query_words.intersection(key_ings)
            score += len(overlap) * 3

            # Check title / description mentions
            if any(w in r["title"].lower() for w in query_words if len(w) > 3):
                score += 2

            scored_recipes.append((score, r))

        # Sort recipes by match score
        scored_recipes.sort(key=lambda x: x[0], reverse=True)

        if scored_recipes and scored_recipes[0][0] > 0:
            top_candidates = [r for s, r in scored_recipes if s > 0][:2]
        else:
            # If no direct match, return best general recipes
            top_candidates = [self.recipes[0]] if self.recipes else []

        for r in top_candidates:
            matched_recipes.append(
                RecipeCard(
                    title=r["title"],
                    description=r["description"],
                    prep_time_min=r["prep_time_min"],
                    cook_time_min=r["cook_time_min"],
                    total_time_min=r["total_time_min"],
                    difficulty=r["difficulty"],
                    servings=r["servings"],
                    calories_per_serving=r.get("calories_per_serving"),
                    ingredients=r["ingredients"],
                    instructions=r["instructions"],
                    substitutions=r["substitutions"],
                    allergen_notes=r["allergen_notes"],
                    storage_and_handling=r["storage_and_handling"],
                    dietary_tags=r.get("dietary_tags", [])
                )
            )

        # Contextual response text
        if "replace" in user_msg or "substitute" in user_msg:
            intent = "ingredient_substitution"
            resp_text = (
                "Here are culinary ingredient substitution rules: For buttermilk, use milk + 1 tbsp vinegar or lemon juice. "
                "For eggs in baking, use 1/4 cup applesauce or 1 tbsp flaxseed meal mixed with 3 tbsp warm water. "
                "For heavy cream, combine whole milk with melted unsalted butter or use coconut cream. "
                "See the recipe card below for specific substitutions relevant to this dish."
            )
        elif "healthy" in user_msg or "dinner" in user_msg:
            intent = "recipe_recommendation"
            resp_text = (
                f"I've selected {len(matched_recipes)} wholesome recipe(s) tailored to your dietary goals. "
                "Each recipe emphasizes high nutrient density, balanced macronutrients, and simple homestyle preparation."
            )
        elif matched_recipes:
            intent = "ingredient_recipe_generation"
            resp_text = (
                f"Based on your request, I found an ideal match: **{matched_recipes[0].title}**. "
                "Complete step-by-step cooking instructions, ingredient measurements, and food safety handling tips are detailed below."
            )
        else:
            intent = "general_culinary_inquiry"
            resp_text = (
                "I am your Food Verse AI Cooking Assistant. Ask me for recipes using ingredients you already have at home, "
                "dietary substitutions, step-by-step techniques, or safe storage advice!"
            )

        suggestions = [
            "What can I cook with potatoes, tomatoes, and onions?",
            "Suggest a healthy high-protein vegetarian dinner",
            "How can I replace heavy cream in soup?",
            "What is the best way to meal prep chicken breast safely?"
        ]

        return CookingChatResponse(
            response_text=resp_text,
            recipes=matched_recipes,
            mode="Predefined Culinary Intelligence Engine (Offline Fallback)",
            suggestions=suggestions,
            detected_intent=intent
        )

    def _call_gemini_api(self, req: CookingChatRequest, api_key: str) -> CookingChatResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        system_prompt = (
            "You are Food Verse AI, a master chef and culinary nutritionist. "
            "Respond helpfully to user food queries. If the user asks for a recipe, provide a structured recipe "
            "with title, prep time, cook time, difficulty, servings, exact ingredients, step-by-step instructions, "
            "substitutions, allergens, and safe food handling guidance. "
            "Keep the reply professional, appetizing, and scientifically accurate."
        )

        prompt_text = f"{system_prompt}\n\nUser Question: {req.message}"
        if req.available_ingredients:
            prompt_text += f"\nAvailable Ingredients: {', '.join(req.available_ingredients)}"
        if req.dietary_preference:
            prompt_text += f"\nDietary Preference: {req.dietary_preference}"

        payload = {
            "contents": [
                {"parts": [{"text": prompt_text}]}
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1000
            }
        }

        resp = requests.post(url, json=payload, timeout=12)
        if resp.status_code == 200:
            data = resp.json()
            generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Use our fallback recipe card structured parser if possible
            fallback_res = self._fallback_culinary_engine(req)
            return CookingChatResponse(
                response_text=generated_text,
                recipes=fallback_res.recipes,
                mode="Gemini LLM Connected",
                suggestions=[
                    "Give me another variation of this dish",
                    "How many calories are in this recipe?",
                    "What wine or beverage pairs best with this?"
                ],
                detected_intent="llm_generated_culinary_guidance"
            )
        else:
            raise RuntimeError(f"Gemini API returned status {resp.status_code}: {resp.text}")

cooking_service = CookingService()
