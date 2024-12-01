from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    name: str
    email: str
    bio: Optional[str] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    followers: List[str] = []
    following: List[str] = []

    class Config:
        orm_mode = True