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
    quest_date = db.Column(db.Date, unique=True) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Photo(db.Model):
    __tablename__ = "photos"
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"))
    file_path = db.Column(db.Text, nullable=False) 
    upload_date = db.Column(db.DateTime, server_default=db.func.now()) 
    is_analysed = db.Column(db.Boolean, default=False)  # Indique si la photo a été analysée par l'IA
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Detection(db.Model):
    __tablename__ = "detections"
    id = db.Column(db.Integer, primary_key=True, index=True)
    photo_id = db.Column(db.Integer, db.ForeignKey("photos.id", ondelete="CASCADE"))
    object_name = db.Column(db.String(100))  # ex: "pomme", "chaise"
    confidence = db.Column(db.Float)         # Score de confiance entre 0.0 et 1.0
    bbox = db.Column(db.JSON)                 # Coordonnées sous la forme [x1, y1, x2, y2]
    challenge_object = db.Column(db.String(100))  # L'objet du défi
    is_challenge_object = db.Column(db.Boolean, default=False)  # True si correspond au défi du jour
    created_at = db.Column(db.DateTime, server_default=db.func.now())

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
