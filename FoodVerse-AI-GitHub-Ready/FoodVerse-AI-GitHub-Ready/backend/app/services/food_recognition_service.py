import os
import time
import json
import re
from pathlib import Path
from PIL import Image
import numpy as np
import torch
import torchvision
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

from backend.app.schemas.food_schemas import FoodPredictionItem, FoodRecognitionResponse
from backend.app.core.config import settings

# Configure Torch Hub cache to use local directory
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
TORCH_CACHE_DIR = MODELS_DIR / "torch_cache"
TORCH_CACHE_DIR.mkdir(parents=True, exist_ok=True)
os.environ["TORCH_HOME"] = str(TORCH_CACHE_DIR)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "usda_nutrition_db.json"

# ImageNet class index to clean food metadata mapping
IMAGENET_FOOD_MAPPING = {
    924: {"name": "Guacamole", "category": "Dips & Sides", "serving": "2 tablespoons (30g)", "notes": "Healthy monounsaturated oleic acid from ripe avocados."},
    925: {"name": "Consomme / Broth", "category": "Soups", "serving": "1 cup (240ml)", "notes": "Clear savory broth rich in collagen and electrolytes."},
    926: {"name": "Hot Pot", "category": "Prepared Dishes", "serving": "1 bowl (300g)", "notes": "Simmered broth with sliced meats, tofu, and vegetables."},
    927: {"name": "Trifle", "category": "Desserts", "serving": "1 cup (180g)", "notes": "Layered dessert with sponge cake, fruit, custard, and cream."},
    928: {"name": "Ice Cream", "category": "Desserts", "serving": "1/2 cup (66g)", "notes": "Energy dense dairy dessert; contains calcium."},
    929: {"name": "Popsicle / Ice Lolly", "category": "Desserts", "serving": "1 bar (75g)", "notes": "Frozen flavored confection."},
    930: {"name": "French Baguette", "category": "Breads", "serving": "1 medium slice (35g)", "notes": "Crusty wheat bread with complex carbohydrates."},
    931: {"name": "Bagel", "category": "Breads", "serving": "1 medium bagel (105g)", "notes": "Carbohydrate dense boiled-and-baked bread."},
    932: {"name": "Pretzel", "category": "Snacks", "serving": "1 hard pretzel (60g)", "notes": "Traditional baked dough snack."},
    933: {"name": "Cheeseburger", "category": "Burgers & Sandwiches", "serving": "1 sandwich (150g)", "notes": "High protein and iron; contains saturated fats and sodium."},
    934: {"name": "Hot Dog", "category": "Fast Food", "serving": "1 frankfurter in bun (98g)", "notes": "Cured sausage sandwich; monitor sodium intake."},
    935: {"name": "Mashed Potatoes", "category": "Prepared Sides", "serving": "1 cup (210g)", "notes": "Starchy side dish rich in potassium and vitamin B6."},
    936: {"name": "Head Cabbage", "category": "Vegetables", "serving": "1 cup shredded (89g)", "notes": "Rich in anthocyanins and vitamin K."},
    937: {"name": "Fresh Broccoli", "category": "Vegetables", "serving": "1 cup florets (91g)", "notes": "Loaded with sulforaphane, vitamin K, and dietary fiber."},
    938: {"name": "Cauliflower", "category": "Vegetables", "serving": "1 cup pieces (107g)", "notes": "Low carb, rich in choline and glucosinolates."},
    939: {"name": "Zucchini", "category": "Vegetables", "serving": "1 medium zucchini (196g)", "notes": "Low calorie, rich in vitamin A, lutein, and potassium."},
    940: {"name": "Spaghetti Squash", "category": "Vegetables", "serving": "1 cup cooked (155g)", "notes": "Low-carb pasta substitute with beta-carotene."},
    941: {"name": "Acorn Squash", "category": "Vegetables", "serving": "1 cup baked (205g)", "notes": "Rich in potassium, magnesium, and dietary fiber."},
    942: {"name": "Butternut Squash", "category": "Vegetables", "serving": "1 cup cubes (140g)", "notes": "High in provitamin A and potassium."},
    943: {"name": "Crisp Cucumber", "category": "Vegetables", "serving": "1/2 large cucumber (150g)", "notes": "High water content (96%), cucurbitacins, and silica."},
    944: {"name": "Artichoke", "category": "Vegetables", "serving": "1 medium artichoke (128g)", "notes": "Exceptional prebiotic fiber (inulin) content."},
    945: {"name": "Bell Pepper (Capsicum)", "category": "Vegetables", "serving": "1 medium pepper (119g)", "notes": "Dense in capsanthin, vitamin C, and carotenoids."},
    947: {"name": "Fresh Mushroom", "category": "Vegetables", "serving": "1 cup sliced (70g)", "notes": "Source of selenium, copper, and ergothioneine."},
    948: {"name": "Green Apple (Granny Smith)", "category": "Fruits", "serving": "1 medium apple (182g)", "notes": "Rich in pectin fiber, vitamin C, and antioxidants."},
    949: {"name": "Fresh Strawberry", "category": "Fruits", "serving": "1 cup whole (144g)", "notes": "High in vitamin C, manganese, and anthocyanins."},
    950: {"name": "Fresh Orange", "category": "Fruits", "serving": "1 medium orange (131g)", "notes": "Excellent source of vitamin C and bioavailable flavonoids."},
    951: {"name": "Fresh Lemon", "category": "Fruits", "serving": "1 fruit (58g)", "notes": "Abundant citric acid and vitamin C."},
    952: {"name": "Ripe Fig", "category": "Fruits", "serving": "1 large fig (64g)", "notes": "High in soluble fiber, calcium, and potassium."},
    953: {"name": "Pineapple", "category": "Fruits", "serving": "1 cup chunks (165g)", "notes": "Contains bromelain enzyme which supports protein digestion."},
    954: {"name": "Ripe Banana", "category": "Fruits", "serving": "1 medium banana (118g)", "notes": "High in potassium, vitamin B6, and quick-digesting carbohydrates."},
    955: {"name": "Jackfruit", "category": "Fruits", "serving": "1 cup sliced (165g)", "notes": "Rich in fiber and vitamins; common plant-based meat alternative."},
    956: {"name": "Custard Apple", "category": "Fruits", "serving": "1 fruit (150g)", "notes": "Dense in vitamin C and magnesium."},
    957: {"name": "Pomegranate", "category": "Fruits", "serving": "1 cup arils (174g)", "notes": "Packed with punicalagins and polyphenol antioxidants."},
    959: {"name": "Pasta Carbonara", "category": "Prepared Dishes", "serving": "1 plate (250g)", "notes": "Rich Italian pasta with egg, cheese, and cured pork."},
    960: {"name": "Chocolate Sauce", "category": "Desserts", "serving": "2 tablespoons (35g)", "notes": "Rich dessert syrup containing cocoa flavonoids."},
    961: {"name": "Bread Dough", "category": "Bakery", "serving": "1 serving (80g)", "notes": "Fermented yeast wheat dough."},
    962: {"name": "Meatloaf", "category": "Poultry & Meats", "serving": "1 thick slice (115g)", "notes": "Hearty ground meat dish seasoned with herbs."},
    963: {"name": "Pizza (Margherita / Vegetable)", "category": "Prepared Dishes", "serving": "1 slice (107g)", "notes": "Baked dough topped with tomato sauce and mozzarella cheese."},
    964: {"name": "Pot Pie", "category": "Prepared Dishes", "serving": "1 small pie (217g)", "notes": "Baked savory pie crust filled with vegetables and gravy."},
    965: {"name": "Burrito", "category": "Mexican & Wraps", "serving": "1 medium wrap (220g)", "notes": "Flour tortilla wrapped around rice, beans, salsa, and protein."},
    966: {"name": "Red Wine", "category": "Beverages", "serving": "5 oz glass (148ml)", "notes": "Fermented grape beverage containing resveratrol."},
    967: {"name": "Espresso Coffee", "category": "Beverages", "serving": "1 shot (30ml)", "notes": "Concentrated coffee rich in caffeine and chlorogenic acids."},
    969: {"name": "Eggnog", "category": "Beverages", "serving": "1 cup (244g)", "notes": "Rich beverage with milk, cream, sugar, and whipped eggs."}
}

FOOD_WORD_PATTERN = re.compile(
    r'\b(apple|banana|orange|lemon|strawberry|berry|fruit|squash|cabbage|broccoli|cauliflower|zucchini|cucumber|mushroom|bagel|bread|pretzel|burger|cheeseburger|hotdog|pizza|burrito|pasta|pie|stew|soup|wine|coffee|salad|toast|omelet|sandwich|egg|rice)\b',
    re.IGNORECASE
)

class FoodRecognitionService:
    def __init__(self):
        self._load_catalog()
        self._init_deep_model()

    def _load_catalog(self):
        if DATA_PATH.exists():
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                self.catalog = json.load(f)
        else:
            self.catalog = {}

    def _init_deep_model(self):
        try:
            print("[FoodRecognitionService] Initializing PyTorch MobileNetV3 Small...")
            self.weights = MobileNet_V3_Small_Weights.DEFAULT
            self.model = mobilenet_v3_small(weights=self.weights)
            self.model.eval()
            self.preprocess = self.weights.transforms()
            self.categories = self.weights.meta["categories"]
            self.model_loaded = True
            print("[FoodRecognitionService] MobileNetV3 Small initialized successfully.")
        except Exception as e:
            print(f"[FoodRecognitionService] Error initializing deep learning model: {e}")
            self.model_loaded = False

    def analyze_image(self, image_path: Path) -> FoodRecognitionResponse:
        start_time = time.time()
        
        # Load image via PIL
        try:
            pil_img = Image.open(image_path).convert("RGB")
        except Exception as e:
            raise ValueError(f"Could not open or decode image: {e}")

        img_np = np.array(pil_img)
        h, w, c = img_np.shape

        # Preprocessing & inference via Deep Learning Model
        predictions = []
        is_food_detected = False
        top_food_prob = 0.0

        if self.model_loaded:
            try:
                input_tensor = self.preprocess(pil_img).unsqueeze(0)
                with torch.no_grad():
                    logits = self.model(input_tensor)
                    probabilities = torch.nn.functional.softmax(logits[0], dim=0)

                # Get top 20 classes from ImageNet 1000
                topk_prob, topk_catid = torch.topk(probabilities, 25)
                
                # Check for food classes
                for i in range(len(topk_catid)):
                    cat_id = int(topk_catid[i].item())
                    prob = float(topk_prob[i].item())
                    raw_label = self.categories[cat_id]

                    # Is this class in our curated food taxonomy?
                    if cat_id in IMAGENET_FOOD_MAPPING:
                        meta = IMAGENET_FOOD_MAPPING[cat_id]
                        predictions.append(
                            FoodPredictionItem(
                                food_name=meta["name"],
                                confidence=round(prob * 100, 1),
                                category=meta["category"],
                                serving_description=meta["serving"],
                                notes=meta["notes"]
                            )
                        )
                    # Check general food keywords in ImageNet labels using word boundary
                    elif FOOD_WORD_PATTERN.search(raw_label):
                        food_name = raw_label.split(",")[0].title()
                        predictions.append(
                            FoodPredictionItem(
                                food_name=food_name,
                                confidence=round(prob * 100, 1),
                                category="Food & Ingredients",
                                serving_description="100g standard serving",
                                notes=f"Detected via ImageNet classification ({raw_label})."
                            )
                        )

            except Exception as e:
                print(f"[FoodRecognitionService] Inference error: {e}")

        # If model recognized specific foods with significant confidence
        if predictions:
            primary = predictions[0]
            top_food_prob = primary.confidence
            candidate_list = predictions[1:5]
            
            # If candidates are empty, provide top alternative food recommendations
            if not candidate_list:
                for k, item in list(self.catalog.items())[:3]:
                    if item.get("name", "").lower() != primary.food_name.lower():
                        candidate_list.append(
                            FoodPredictionItem(
                                food_name=item.get("name", k.title()),
                                confidence=max(5.0, round(primary.confidence * 0.4, 1)),
                                category=item.get("category", "General Food"),
                                serving_description=item.get("serving_description", "100g serving"),
                                notes="Alternative food candidate for confirmation."
                            )
                        )
        else:
            # Fallback visual texture / color similarity against local catalog
            primary, candidate_list = self._visual_similarity_fallback(img_np)
            top_food_prob = primary.confidence

        # Uncertainty evaluation
        # Real ML rule: If top confidence < 25% or top prediction has low probability, flag uncertainty!
        is_uncertain = top_food_prob < 25.0
        uncertainty_msg = None
        if is_uncertain:
            uncertainty_msg = (
                f"Confidence is low ({top_food_prob}%). The image may have challenging lighting, "
                "be partially obscured, or contain an unsupported food. Please verify the food name before nutrition analysis."
            )

        duration = round(time.time() - start_time, 3)
        image_relative_url = f"/uploads/{image_path.name}"

        return FoodRecognitionResponse(
            success=True,
            primary_prediction=primary,
            candidate_predictions=candidate_list,
            image_url=image_relative_url,
            model_name="PyTorch MobileNetV3 (ImageNet-1k Trained Backbone)",
            processing_time_sec=duration,
            is_uncertain=is_uncertain,
            uncertainty_message=uncertainty_msg,
            color_profile={
                "image_width": w,
                "image_height": h,
                "aspect_ratio": round(w / (h + 1e-6), 2)
            }
        )

    def _visual_similarity_fallback(self, img_np: np.ndarray):
        """Color-texture reference search when ImageNet generic classes have low activation."""
        avg_r = float(np.mean(img_np[:, :, 0]))
        avg_g = float(np.mean(img_np[:, :, 1]))
        avg_b = float(np.mean(img_np[:, :, 2]))

        # Red vs Green vs Yellow balance
        if avg_r > avg_g * 1.3 and avg_r > avg_b * 1.3:
            keys = ["apple", "tomato", "strawberries"]
        elif avg_g > avg_r * 1.1 and avg_g > avg_b * 1.1:
            keys = ["spinach", "broccoli", "cucumber"]
        elif avg_r > 150 and avg_g > 140 and avg_b < 100:
            keys = ["banana", "lemon", "sweet_corn"]
        elif avg_r > 140 and avg_g > 80 and avg_b < 60:
            keys = ["orange", "papaya", "bell_pepper"]
        else:
            keys = ["paneer", "tofu", "chicken_breast"]

        primary_key = keys[0]
        item = self.catalog.get(primary_key, {})
        primary = FoodPredictionItem(
            food_name=item.get("name", primary_key.title()),
            confidence=18.5,  # Realistically low confidence for heuristic fallback
            category=item.get("category", "General Food"),
            serving_description=item.get("serving_description", "100g serving"),
            notes=item.get("health_notes", "Visual color spectrum match.")
        )
        
        candidates = []
        for alt_key in keys[1:]:
            alt_item = self.catalog.get(alt_key, {})
            candidates.append(
                FoodPredictionItem(
                    food_name=alt_item.get("name", alt_key.title()),
                    confidence=12.0,
                    category=alt_item.get("category", "General Food"),
                    serving_description=alt_item.get("serving_description", "100g serving"),
                    notes="Visual alternative match."
                )
            )
        return primary, candidates

food_recognition_service = FoodRecognitionService()
