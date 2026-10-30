from pydantic import BaseModel
from typing import List, Optional, Dict

class HygieneFrameObservation(BaseModel):
    timestamp_sec: float
    frame_index: int
    thumbnail_base64: Optional[str] = None
    hair_covering_status: str  # "Observed (Compliant)", "Not Detected", "Uncertain"
    glove_status: str  # "Observed", "Bare Hands Detected", "Not Applicable"
    cleanliness_indicator: str  # "Clean / Clear", "Minor Clutter", "Debris / Staining Visible"
    concerns: List[str]
    confidence: float

class CorrectiveAction(BaseModel):
    area: str
    urgency: str  # "High", "Medium", "Standard"
    recommendation: str

class HygieneReportResponse(BaseModel):
    success: bool
    video_filename: str
    duration_sec: float
    frames_analyzed: int
    overall_hygiene_score: int  # 0 - 100
    risk_level: str  # "Low Risk", "Moderate Concern", "Elevated Risk"
    compliance_summary: str
    hair_covering_compliance_pct: float
    glove_compliance_pct: float
    surface_cleanliness_pct: float
    frame_observations: List[HygieneFrameObservation]
    potential_concerns: List[str]
    corrective_actions: List[CorrectiveAction]
    model_mode: str
    uncertainty_statement: str
    disclaimer: str
