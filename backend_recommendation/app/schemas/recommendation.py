from pydantic import BaseModel
from typing import List, Optional

class CollaborativeFilteringDataItem(BaseModel):
    user_id: str
    liked_posts: List[str]

class ContentBasedFilteringDataItem(BaseModel):
    post_id: str
    title: str

class RecommendationRequest(BaseModel):
    user_id: str
    user_query: str
    CollaborativeFilteringData: List[CollaborativeFilteringDataItem]
    ContentBasedFilteringData: List[ContentBasedFilteringDataItem]

class PostRecommendation(BaseModel):
    post_id: str  
    title: str  
    media: List[str]  
    likes_count: int 
    created_at: str  
    user_id: str 
    user_name: str  

    class Config:
         from_attributes = True 

class RecommendationResponse(BaseModel):
    recommendationPostsId: List[str]
