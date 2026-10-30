from fastapi import APIRouter, HTTPException
from backend.app.schemas.cooking_schemas import CookingChatRequest, CookingChatResponse
from backend.app.services.cooking_service import cooking_service

router = APIRouter(prefix="/cooking", tags=["AI Cooking Assistant"])

@router.post("/chat", response_model=CookingChatResponse)
def cooking_chat(req: CookingChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    try:
        response = cooking_service.handle_chat(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cooking assistant error: {str(e)}")
