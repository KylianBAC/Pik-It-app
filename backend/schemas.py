from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    points: int

    class Config:
        orm_mode = True

class QuestCreate(BaseModel):
    name: str
    description: str
    object_to_find: str
    reward_points: int

class Quest(BaseModel):
    id: int
    name: str
    description: str
    object_to_find: str
    reward_points: int

    class Config:
        orm_mode = True

class PhotoCreate(BaseModel):
    user_id: int
    quest_id: int
    photo_url: str

class Photo(BaseModel):
    id: int
    user_id: int
    quest_id: int
    photo_url: str
    is_validated: bool
    validation_result: Optional[dict]

    class Config:
        orm_mode = True