from pydantic import BaseModel
from typing import List, Optional

class PostRecommendation(BaseModel):
    post_id: str  
    title: str  
    media: List[str]  
    likes_count: int 
    created_at: str  
    user_id: str 
    user_name: str  

    class Config:
        orm_mode = True  

class RecommendationResponse(BaseModel):
    user_id: str  
    recommended_posts: List[PostRecommendation]  
    recommendation_algorithm: str  

    class Config:
        orm_mode = True 