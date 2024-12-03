from pydantic import BaseModel
from typing import List, Optional

class PostBase(BaseModel):
    title: str
    media: List[str] = []
    status: str = 'public'
    likes: List[str] = []
    user_id: str

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: str  

    class Config:
        from_attributes = True