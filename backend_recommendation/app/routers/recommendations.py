from fastapi import APIRouter
from app.services.algorithms import recommend_posts

router = APIRouter()

@router.get("/recommendations/{user_id}")
def get_recommendations(user_id: int):
    recommendations = recommend_posts(user_id)
    return {
        "user_id": user_id,
        "recommendations": recommendations
    }