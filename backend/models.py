from .database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, index=True)
    username = db.Column(db.String, unique=True, index=True)
    email = db.Column(db.String, unique=True, index=True)
    password_hash = db.Column(db.String)
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Quest(db.Model):
    __tablename__ = "quests"
    id = db.Column(db.Integer, primary_key=True, index=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    object_to_find = db.Column(db.String)
    reward_points = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Photo(db.Model):
    __tablename__ = "photos"
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    quest_id = db.Column(db.Integer, db.ForeignKey("quests.id"))
    photo_url = db.Column(db.String)
    is_validated = db.Column(db.Boolean, default=False)
    validation_result = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Game(db.Model):
    __tablename__ = "games"
    id = db.Column(db.Integer, primary_key=True, index=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    status = db.Column(db.String, default="en cours")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GameObject(db.Model):
    __tablename__ = "game_objects"
    id = db.Column(db.Integer, primary_key=True, index=True)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id"))
    object_to_find = db.Column(db.String)
    is_completed = db.Column(db.Boolean, default=False)

class Friend(db.Model):
    __tablename__ = "friends"
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    friend_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    status = db.Column(db.String, default="en attente")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Reward(db.Model):
    __tablename__ = "rewards"
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    reward_type = db.Column(db.String)
    reward_value = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)