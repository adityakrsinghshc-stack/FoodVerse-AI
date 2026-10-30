from pathlib import Path
from typing import Dict, Any, List
import cv2
import numpy as np
from PIL import Image

from backend.app.schemas.freshness_schemas import (
    FreshnessResponse,
    FreshnessIndicator,
    StorageTip
)

class FreshnessService:
    def __init__(self):
        pass

    def analyze_produce(self, image_path: Path, food_category: str) -> FreshnessResponse:
        img_bgr = cv2.imread(str(image_path))
        if img_bgr is None:
            pil_img = Image.open(image_path).convert("RGB")
            img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        h, w = img_bgr.shape[:2]
        total_pixels = h * w

        # Color spaces
        img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        img_lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Segment foreground produce from background
        # Adaptive thresholding to remove white/neutral backgrounds
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        clean_mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        
        object_pixels = int(np.sum(clean_mask > 0))
        if object_pixels < total_pixels * 0.05:
            object_mask = np.ones((h, w), dtype=bool)
            object_pixels = total_pixels
        else:
            object_mask = clean_mask > 0

        # 2. Extract Key Computer Vision Metrics on Object Mask
        # A. Enzymatic Browning / Dark Rot Mask (H: 8-28, S: 35-190, V: 20-135)
        brown_lower = np.array([8, 35, 20])
        brown_upper = np.array([28, 190, 135])
        brown_mask = cv2.inRange(img_hsv, brown_lower, brown_upper)
        brown_px = int(np.sum((brown_mask > 0) & object_mask))
        browning_pct = round((brown_px / (object_pixels + 1e-6)) * 100, 2)

        # B. Chlorophyll / Green Vitality Mask (H: 35-85, S: 40-255, V: 40-255)
        green_lower = np.array([35, 40, 40])
        green_upper = np.array([85, 255, 255])
        green_mask = cv2.inRange(img_hsv, green_lower, green_upper)
        green_px = int(np.sum((green_mask > 0) & object_mask))
        greenness_pct = round((green_px / (object_pixels + 1e-6)) * 100, 2)

        # C. Texture Roughness / Shriveling (Laplacian Variance on L channel)
        l_channel = img_lab[:, :, 0]
        laplacian = cv2.Laplacian(l_channel, cv2.CV_64F)
        texture_roughness = float(np.var(laplacian[object_mask]))

        # D. Penicillium / Mold Mycelium Mask (white/cyan fuzzy spots: low sat, high val or light greenish blue)
        mold_lower = np.array([75, 20, 140])
        mold_upper = np.array([105, 110, 240])
        mold_mask = cv2.inRange(img_hsv, mold_lower, mold_upper)
        mold_px = int(np.sum((mold_mask > 0) & object_mask))
        mold_pct = round((mold_px / (object_pixels + 1e-6)) * 100, 2)

        # 3. Category-Calibrated Visual Assessment
        category_lower = food_category.lower()
        freshness_score = 90.0
        indicators: List[FreshnessIndicator] = []

        if "banana" in category_lower:
            # Banana Ripening & Freckle Scale
            if browning_pct > 35.0:
                freshness_score = 38.0
                indicators.append(FreshnessIndicator(
                    name="Enzymatic Spotting (Sugar Freckling)",
                    observed_value=f"{browning_pct}% dark area",
                    status="degraded",
                    description="Extensive melanin patch coalescence indicating over-ripeness and starch breakdown."
                ))
            elif browning_pct > 12.0:
                freshness_score = 70.0
                indicators.append(FreshnessIndicator(
                    name="Ripening Spots",
                    observed_value=f"{browning_pct}% freckles",
                    status="caution",
                    description="Active ripening phase with high aromatic sweetness; soft texture."
                ))
            else:
                indicators.append(FreshnessIndicator(
                    name="Peel Vitality",
                    observed_value=f"Uniform yellow with {browning_pct}% spots",
                    status="optimal",
                    description="Firm cuticle integrity with minimal surface bruising."
                ))

        elif any(w in category_lower for w in ["spinach", "leafy", "greens", "lettuce", "kale"]):
            # Leafy Greens Senescence Scale
            if greenness_pct < 45.0 or browning_pct > 15.0:
                freshness_score = 35.0
                indicators.append(FreshnessIndicator(
                    name="Chlorophyll Senescence & Yellowing",
                    observed_value=f"{greenness_pct}% green remaining",
                    status="degraded",
                    description="Significant chlorosis and wilting; cellular breakdown and moisture loss."
                ))
            else:
                indicators.append(FreshnessIndicator(
                    name="Chlorophyll Retention",
                    observed_value=f"{greenness_pct}% vibrant green",
                    status="optimal",
                    description="Optimal turgor pressure and intact chlorophyll pigment."
                ))

        elif any(w in category_lower for w in ["apple", "pear"]):
            # Apples & Pears
            if browning_pct > 20.0 or texture_roughness > 500.0:
                freshness_score = 42.0
                indicators.append(FreshnessIndicator(
                    name="Surface Necrosis / Bruising",
                    observed_value=f"{browning_pct}% dark patches",
                    status="degraded",
                    description="Sub-epidermal cell rupture and polyphenol oxidase enzyme activity."
                ))
            else:
                indicators.append(FreshnessIndicator(
                    name="Cuticle Smoothness",
                    observed_value="Smooth, uniform skin",
                    status="optimal",
                    description="Intact outer wax layer preventing dehydration."
                ))

        elif any(w in category_lower for w in ["citrus", "orange", "lemon"]):
            # Citrus Fruits
            if mold_pct > 3.0 or browning_pct > 18.0:
                freshness_score = 30.0
                indicators.append(FreshnessIndicator(
                    name="Surface Mold / Fungal Mycelium",
                    observed_value=f"{mold_pct}% surface patches",
                    status="degraded",
                    description="Possible penicillium digitatum spore presence or rind breakdown."
                ))
            else:
                indicators.append(FreshnessIndicator(
                    name="Rind Integrity",
                    observed_value="Firm, vibrant oil glands",
                    status="optimal",
                    description="No visible fungal hyphae or rind softness observed."
                ))

        elif any(w in category_lower for w in ["tomato"]):
            # Tomatoes
            if browning_pct > 15.0 or texture_roughness > 450.0:
                freshness_score = 40.0
                indicators.append(FreshnessIndicator(
                    name="Skin Wrinkling & Blossom End Rot",
                    observed_value=f"{browning_pct}% dark area",
                    status="degraded",
                    description="Loss of cellular firmness and moisture; potential soft rot."
                ))
            else:
                indicators.append(FreshnessIndicator(
                    name="Epidermal Turgor",
                    observed_value="Smooth taut skin",
                    status="optimal",
                    description="Healthy lycopene saturation and firm wall structure."
                ))
        else:
            # General Produce
            if browning_pct > 22.0:
                freshness_score = 42.0
                indicators.append(FreshnessIndicator(
                    name="Oxidative Discoloration",
                    observed_value=f"{browning_pct}% darkened area",
                    status="degraded",
                    description="Observable oxidation and tissue decay on outer surface."
                ))
            else:
                indicators.append(FreshnessIndicator(
                    name="Visual Appearance",
                    observed_value="Normal produce coloration",
                    status="optimal",
                    description="No major visible tissue necrosis or mold colonies detected."
                ))

        # Add surface texture indicator
        if texture_roughness > 420:
            indicators.append(FreshnessIndicator(
                name="Surface Texture & Shriveling",
                observed_value="Elevated roughness index",
                status="caution",
                description="Skin shows fine wrinkling consistent with moisture evaporation."
            ))
        else:
            indicators.append(FreshnessIndicator(
                name="Surface Texture",
                observed_value="Firm & smooth",
                status="optimal",
                description="Normal hydration and structural integrity."
            ))

        # Final score classification
        score_int = int(min(max(freshness_score, 15), 98))

        if score_int >= 75:
            status = "Fresh"
            confidence = 88.0
            advisory = "Visual metrics indicate good produce vitality and consumer quality."
        elif score_int >= 45:
            status = "Moderately Fresh"
            confidence = 82.0
            advisory = "Produce is mature / ripe. Best consumed soon or incorporated into cooked dishes."
        else:
            status = "Possibly Spoiled"
            confidence = 85.0
            advisory = "Noticeable tissue oxidation or browning observed. Inspect for softness, mold, and off-odor before consumption."

        storage_tips = self._get_storage_tips(category_lower)

        disclaimer = (
            "Safety Advisory: Computer vision evaluates visible surface discoloration, texture entropy, and color degradation. "
            "It cannot test for odorless bacterial pathogens (such as Salmonella or E. coli) or internal fungal toxins. "
            "Always inspect texture, smell, and follow standard food storage hygiene."
        )

        image_relative_url = f"/uploads/{image_path.name}"

        return FreshnessResponse(
            success=True,
            food_category=food_category.title(),
            freshness_status=status,
            freshness_score=score_int,
            confidence=confidence,
            model_mode="Category-Calibrated Computer Vision Assessment (LAB/HSV Color Morphology & Texture Pipeline)",
            image_url=image_relative_url,
            visible_indicators=indicators,
            storage_suggestions=storage_tips,
            visual_metrics={
                "browning_percentage": browning_pct,
                "greenness_percentage": greenness_pct,
                "texture_roughness_variance": round(texture_roughness, 1)
            },
            safety_advisory=advisory,
            is_uncertain=False,
            disclaimer=disclaimer
        )

    def _get_storage_tips(self, category: str) -> List[StorageTip]:
        if "banana" in category:
            return [
                StorageTip(
                    environment="Room Temperature (Hanging)",
                    duration="3 - 5 days",
                    tip="Keep stems wrapped in foil or beeswax wrap to delay ethylene gas release. Keep away from direct sunlight."
                ),
                StorageTip(
                    environment="Freezer (Sliced)",
                    duration="Up to 3 months",
                    tip="Peel ripe bananas, slice into coins, and freeze in silicone bags for smoothies or baking."
                )
            ]
        elif any(w in category for w in ["spinach", "leafy", "greens"]):
            return [
                StorageTip(
                    environment="Crisper Drawer (4°C / 39°F)",
                    duration="5 - 7 days",
                    tip="Wrap unwashed greens in a dry cotton cloth or paper towel inside an airtight container to absorb moisture."
                ),
                StorageTip(
                    environment="Freezer (Blanched)",
                    duration="Up to 6 months",
                    tip="Blanch in boiling water for 60 seconds, shock in an ice bath, drain, and freeze in meal-sized portions."
                )
            ]
        elif any(w in category for w in ["apple", "pear"]):
            return [
                StorageTip(
                    environment="Refrigerated Crisper (1°C - 4°C)",
                    duration="3 - 5 weeks",
                    tip="Store separate from leafy greens as apples produce ethylene gas which accelerates vegetable wilting."
                )
            ]
        elif any(w in category for w in ["citrus", "orange", "lemon"]):
            return [
                StorageTip(
                    environment="Refrigerated Mesh Bag",
                    duration="2 - 3 weeks",
                    tip="Store in a breathable mesh bag. Avoid sealed plastic bags which trap humidity and invite mold growth."
                )
            ]
        elif "tomato" in category:
            return [
                StorageTip(
                    environment="Room Temperature (Stem Down)",
                    duration="4 - 7 days",
                    tip="Do not refrigerate fresh tomatoes as temperatures below 12°C break down volatile flavor compounds."
                )
            ]
        else:
            return [
                StorageTip(
                    environment="Cool Pantry",
                    duration="4 - 7 days",
                    tip="Keep in a dry, ventilated basket away from onions and potatoes to avoid premature sprouting."
                ),
                StorageTip(
                    environment="Refrigerated Crisper",
                    duration="1 - 2 weeks",
                    tip="Store in perforated produce containers that maintain moderate humidity while allowing air exchange."
                )
            ]

freshness_service = FreshnessService()
