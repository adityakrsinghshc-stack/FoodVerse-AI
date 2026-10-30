from typing import List, Dict, Any, Optional
from backend.app.schemas.meal_plan_schemas import (
    MealPlanRequest,
    MealPlanResponse,
    DailyMealPlan,
    MealDish,
    ShoppingCategory
)

class MealPlanService:
    def __init__(self):
        # Dish pool categorized by meal type and diet
        self.dishes = {
            "breakfast": [
                {
                    "name": "Overnight Oats with Chia Seeds & Almonds",
                    "cals": 340, "p": 12, "c": 48, "f": 11, "cost": 2.20,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": ["nuts"],
                    "ingredients": ["1/2 cup rolled oats", "1 cup almond milk", "1 tbsp chia seeds", "10 crushed almonds", "1 tsp honey or maple syrup"],
                    "prep": "Mix oats, chia seeds, and milk in a mason jar. Chill overnight. Top with almonds and fruit in the morning."
                },
                {
                    "name": "Masala Scrambled Eggs with Multigrain Toast",
                    "cals": 380, "p": 22, "c": 32, "f": 16, "cost": 2.80,
                    "diet": ["eggetarian", "non-vegetarian"],
                    "allergens": ["eggs", "gluten"],
                    "ingredients": ["2 whole eggs + 1 egg white", "1/2 tomato diced", "1/2 onion diced", "1 green chili", "2 slices whole grain bread", "1 tsp butter"],
                    "prep": "Whisk eggs with a pinch of turmeric and salt. Sauté onion and tomato, pour eggs, and scramble gently for 2 minutes. Serve on toast."
                },
                {
                    "name": "Tofu Scramble with Sautéed Spinach & Avocado",
                    "cals": 320, "p": 20, "c": 18, "f": 18, "cost": 3.10,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": ["soy"],
                    "ingredients": ["150g firm crumbled tofu", "1 cup baby spinach", "1/4 sliced avocado", "1/2 tsp turmeric & black pepper", "1 tsp olive oil"],
                    "prep": "Sauté crumbled tofu with turmeric, nutritional yeast, and salt. Fold in spinach until wilted. Garnish with sliced avocado."
                },
                {
                    "name": "Vegetable Poha (Flattened Rice) with Peanuts",
                    "cals": 310, "p": 8, "c": 52, "f": 9, "cost": 1.50,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": ["peanuts"],
                    "ingredients": ["1 cup thick poha (rinsed)", "1 small onion diced", "1 small potato cubed", "2 tbsp roasted peanuts", "1/2 tsp mustard seeds", "Fresh cilantro & lemon"],
                    "prep": "Temper mustard seeds in oil. Fry peanuts and potatoes until tender. Add onions and turmeric. Gently fold in soft poha. Finish with lemon juice."
                }
            ],
            "lunch": [
                {
                    "name": "High-Protein Palak Paneer with 2 Whole Wheat Rotis",
                    "cals": 520, "p": 26, "c": 54, "f": 22, "cost": 3.80,
                    "diet": ["vegetarian", "eggetarian"],
                    "allergens": ["dairy", "gluten"],
                    "ingredients": ["150g paneer cubes", "200g spinach puree", "1 onion & 1 tomato gravy base", "2 fresh whole wheat rotis", "1 tsp ghee"],
                    "prep": "Simmer spinach puree with tempered garlic and spices. Fold in paneer cubes. Serve warm with 2 freshly puffed rotis."
                },
                {
                    "name": "Herb Grilled Chicken Breast with Quinoa & Steamed Veggies",
                    "cals": 540, "p": 46, "c": 44, "f": 16, "cost": 5.20,
                    "diet": ["non-vegetarian"],
                    "allergens": [],
                    "ingredients": ["180g lean chicken breast", "3/4 cup cooked quinoa", "1 cup broccoli & carrots", "1 tbsp lemon herb vinaigrette"],
                    "prep": "Grill seasoned chicken breast for 6 mins per side. Steam vegetables. Serve alongside fluffy cooked quinoa."
                },
                {
                    "name": "Chana Masala (Spiced Chickpea Curry) with Brown Basmati Rice",
                    "cals": 490, "p": 18, "c": 82, "f": 9, "cost": 2.60,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": [],
                    "ingredients": ["1.5 cups cooked chickpeas", "1 cup cooked brown basmati rice", "Tomato onion ginger masala gravy", "1 tbsp fresh coriander"],
                    "prep": "Simmer chickpeas in spiced tomato gravy for 12 minutes until deeply flavored. Plate over steaming brown basmati rice."
                },
                {
                    "name": "Mediterranean Falafel Bowl with Hummus & Tabbouleh",
                    "cals": 480, "p": 16, "c": 64, "f": 18, "cost": 3.90,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": ["sesame"],
                    "ingredients": ["4 baked falafel patties", "2 tbsp creamy hummus", "1/2 cup cracked wheat tabbouleh", "Diced cucumbers and cherry tomatoes"],
                    "prep": "Bake falafel patties at 200°C for 15 mins. Assemble with hummus, tabbouleh, and crisp cucumber-tomato salad."
                }
            ],
            "snack": [
                {
                    "name": "Greek Yogurt Bowl with Berries & Flaxseeds",
                    "cals": 180, "p": 15, "c": 19, "f": 4, "cost": 1.80,
                    "diet": ["vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": ["dairy"],
                    "ingredients": ["150g plain nonfat Greek yogurt", "1/2 cup blueberries or strawberries", "1 tsp ground flaxseeds"],
                    "prep": "Spoon yogurt into a bowl, layer with fresh berries and sprinkle flaxseeds for omega-3 fiber."
                },
                {
                    "name": "Roasted Spiced Makhana (Fox Nuts)",
                    "cals": 140, "p": 4, "c": 22, "f": 4, "cost": 1.20,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": [],
                    "ingredients": ["2 cups lotus seeds / makhana", "1 tsp olive oil or ghee", "Pinch of chaat masala and black salt"],
                    "prep": "Slow roast makhana on low heat for 6-8 minutes until crisp. Toss with olive oil and spices."
                },
                {
                    "name": "Apple Slices with Natural Peanut Butter",
                    "cals": 210, "p": 7, "c": 26, "f": 10, "cost": 1.40,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": ["peanuts"],
                    "ingredients": ["1 medium crisp apple", "1.5 tbsp 100% natural peanut butter"],
                    "prep": "Slice apple into wedges. Serve with creamy peanut butter for dipping."
                }
            ],
            "dinner": [
                {
                    "name": "Moong Dal Tadka with Steamed Rice & Cucumber Raita",
                    "cals": 450, "p": 19, "c": 70, "f": 9, "cost": 2.50,
                    "diet": ["vegetarian", "eggetarian"],
                    "allergens": ["dairy"],
                    "ingredients": ["1 cup yellow moong dal", "3/4 cup steamed rice", "1/2 cup low-fat cucumber yogurt raita", "Cumin garlic tadka"],
                    "prep": "Boil moong dal until tender. Top with sizzling cumin, garlic, and ghee tadka. Serve alongside rice and cooling raita."
                },
                {
                    "name": "Pan-Seared Atlantic Salmon with Roasted Asparagus",
                    "cals": 470, "p": 38, "c": 12, "f": 28, "cost": 6.80,
                    "diet": ["non-vegetarian"],
                    "allergens": ["fish"],
                    "ingredients": ["150g wild salmon fillet", "1 bunch fresh asparagus spears", "1 tbsp olive oil", "Lemon wedges & fresh dill"],
                    "prep": "Pan-sear salmon in cast-iron for 4 mins skin side down, flip for 3 mins. Roast asparagus with garlic and olive oil."
                },
                {
                    "name": "Hearty Lentil & Sweet Potato Vegetable Stew",
                    "cals": 420, "p": 18, "c": 68, "f": 7, "cost": 2.40,
                    "diet": ["vegan", "vegetarian", "eggetarian", "non-vegetarian"],
                    "allergens": [],
                    "ingredients": ["1 cup brown lentils", "1 medium sweet potato cubed", "1 cup chopped kale or spinach", "Herbed vegetable broth"],
                    "prep": "Simmer lentils and sweet potatoes in rich vegetable broth for 25 minutes. Stir in kale during final 5 minutes."
                },
                {
                    "name": "Grilled Paneer & Vegetable Skewers with Mint Chutney",
                    "cals": 430, "p": 24, "c": 20, "f": 26, "cost": 3.60,
                    "diet": ["vegetarian", "eggetarian"],
                    "allergens": ["dairy"],
                    "ingredients": ["160g paneer cubes", "Bell peppers, red onions, mushrooms", "Yogurt ajwain marinade", "2 tbsp mint coriander chutney"],
                    "prep": "Thread marinated paneer and vegetables onto skewers. Grill on high flame until charred. Serve with spicy mint dip."
                }
            ]
        }

    def generate_meal_plan(self, req: MealPlanRequest) -> MealPlanResponse:
        diet = req.dietary_preference.lower()
        allergies = [a.lower().strip() for a in (req.allergies or [])]
        days_count = 7 if req.duration == "weekly" else 1

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] if days_count == 7 else ["Today's Plan"]
        plan_days: List[DailyMealPlan] = []

        total_plan_cals = 0.0
        total_plan_cost = 0.0
        shopping_items_set = {
            "Produce (Fruits & Vegetables)": set(),
            "Grains, Legumes & Pantry": set(),
            "Proteins & Dairy": set(),
            "Herbs, Spices & Oils": set()
        }

        for i in range(days_count):
            day_label = day_names[i]
            
            # Select meals respecting diet & allergies
            b_dish_data = self._pick_dish("breakfast", diet, allergies, i)
            l_dish_data = self._pick_dish("lunch", diet, allergies, i)
            s_dish_data = self._pick_dish("snack", diet, allergies, i) if req.meals_per_day >= 4 else None
            d_dish_data = self._pick_dish("dinner", diet, allergies, i)

            # Adjust portions slightly based on goal
            cal_multiplier = 1.0
            if req.goal == "weight_management":
                cal_multiplier = 0.88
            elif req.goal == "muscle_gain":
                cal_multiplier = 1.15

            b_dish = self._to_meal_dish(b_dish_data, cal_multiplier)
            l_dish = self._to_meal_dish(l_dish_data, cal_multiplier)
            s_dish = self._to_meal_dish(s_dish_data, cal_multiplier) if s_dish_data else None
            d_dish = self._to_meal_dish(d_dish_data, cal_multiplier)

            day_cals = b_dish.calories + l_dish.calories + d_dish.calories + (s_dish.calories if s_dish else 0)
            day_p = b_dish.protein_g + l_dish.protein_g + d_dish.protein_g + (s_dish.protein_g if s_dish else 0)
            day_c = b_dish.carbs_g + l_dish.carbs_g + d_dish.carbs_g + (s_dish.carbs_g if s_dish else 0)
            day_f = b_dish.fat_g + l_dish.fat_g + d_dish.fat_g + (s_dish.fat_g if s_dish else 0)
            day_cost = b_dish.estimated_cost_usd + l_dish.estimated_cost_usd + d_dish.estimated_cost_usd + (s_dish.estimated_cost_usd if s_dish else 0)

            total_plan_cals += day_cals
            total_plan_cost += day_cost

            # Collect shopping list items
            for d in [b_dish_data, l_dish_data, s_dish_data, d_dish_data]:
                if not d:
                    continue
                for ing in d.get("ingredients", []):
                    ing_lower = ing.lower()
                    if any(w in ing_lower for w in ["apple", "spinach", "tomato", "onion", "lemon", "broccoli", "carrot", "blueberry", "garlic", "ginger", "cucumber", "avocado", "asparagus"]):
                        shopping_items_set["Produce (Fruits & Vegetables)"].add(ing)
                    elif any(w in ing_lower for w in ["chicken", "paneer", "salmon", "tofu", "egg", "yogurt", "cheese", "milk"]):
                        shopping_items_set["Proteins & Dairy"].add(ing)
                    elif any(w in ing_lower for w in ["oats", "rice", "dal", "quinoa", "chickpea", "bread", "roti", "seeds", "poha", "lentil", "chia", "almonds"]):
                        shopping_items_set["Grains, Legumes & Pantry"].add(ing)
                    else:
                        shopping_items_set["Herbs, Spices & Oils"].add(ing)

            plan_days.append(
                DailyMealPlan(
                    day=day_label,
                    breakfast=b_dish,
                    lunch=l_dish,
                    evening_snack=s_dish,
                    dinner=d_dish,
                    total_calories=round(day_cals, 1),
                    total_protein_g=round(day_p, 1),
                    total_carbs_g=round(day_c, 1),
                    total_fat_g=round(day_f, 1),
                    approximate_daily_cost=round(day_cost, 2)
                )
            )

        # Build categorized shopping list
        shopping_categories: List[ShoppingCategory] = []
        for cat_name, items in shopping_items_set.items():
            if items:
                shopping_categories.append(
                    ShoppingCategory(category=cat_name, items=sorted(list(items)))
                )

        avg_daily_cals = round(total_plan_cals / days_count, 1)

        title = f"{req.dietary_preference.title()} {req.goal.replace('_', ' ').title()} Meal Plan ({req.duration.title()})"

        disclaimer = (
            "Medical & Nutritional Disclaimer: Meal plan nutritional totals are calculated estimates. "
            "Portion sizes and individual metabolic demands vary. This plan is designed for general wellness guidance "
            "and does not constitute medical nutrition therapy or clinical advice."
        )

        return MealPlanResponse(
            title=title,
            dietary_preference=req.dietary_preference,
            goal=req.goal,
            duration=req.duration,
            days=plan_days,
            consolidated_shopping_list=shopping_categories,
            average_daily_calories=avg_daily_cals,
            estimated_total_cost=round(total_plan_cost, 2),
            nutrition_estimate_disclaimer=disclaimer,
            saved=False
        )

    def _pick_dish(self, meal_type: str, diet: str, allergies: List[str], offset: int) -> Dict[str, Any]:
        pool = self.dishes.get(meal_type, [])
        # Filter by diet
        eligible = [
            d for d in pool
            if diet in d.get("diet", [])
            and not any(a in d.get("allergens", []) for a in allergies)
        ]
        if not eligible:
            # Fallback to general dish in pool
            eligible = pool

        return eligible[offset % len(eligible)]

    def _to_meal_dish(self, data: Optional[Dict[str, Any]], multiplier: float) -> MealDish:
        if not data:
            return MealDish(
                name="Optional Light Snack / Herbal Tea",
                calories=50.0,
                protein_g=1.0,
                carbs_g=8.0,
                fat_g=0.5,
                ingredients=["Cup of chamomile or green tea", "1 tsp raw honey"],
                prep_instructions="Brew in hot water for 3 minutes.",
                estimated_cost_usd=0.50
            )

        return MealDish(
            name=data["name"],
            calories=round(data["cals"] * multiplier, 1),
            protein_g=round(data["p"] * multiplier, 1),
            carbs_g=round(data["c"] * multiplier, 1),
            fat_g=round(data["f"] * multiplier, 1),
            ingredients=data["ingredients"],
            prep_instructions=data["prep"],
            estimated_cost_usd=data["cost"]
        )

meal_plan_service = MealPlanService()
