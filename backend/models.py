from .database import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Champs pour les points et statistiques
    total_points = db.Column(db.Integer, default=0)
    total_coins = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    challenges_completed = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Quest(db.Model):
    __tablename__ = "quests"
    id = db.Column(db.Integer, primary_key=True, index=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    object_to_find = db.Column(db.String)
    reward_points = db.Column(db.Integer)
    quest_date = db.Column(db.Date, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ObjectList(db.Model):
    __tablename__ = "object_lists"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    list = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Photo(db.Model):
    __tablename__ = "photos"
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"))
    file_path = db.Column(db.Text, nullable=False)
    upload_date = db.Column(db.DateTime, server_default=db.func.now())
    # Indique si la photo a été analysée par l'IA
    is_analysed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())


class Detection(db.Model):
    __tablename__ = "detections"
    id = db.Column(db.Integer, primary_key=True, index=True)
    photo_id = db.Column(db.Integer, db.ForeignKey("photos.id", ondelete="CASCADE"))
    object_name = db.Column(db.String(100))  # ex: "pomme", "chaise"
    # Score de confiance entre 0.0 et 1.0
    confidence = db.Column(db.Float)
    # Coordonnées sous la forme [x1, y1, x2, y2]
    bbox = db.Column(db.JSON)
    challenge_id = db.Column(db.Integer, db.ForeignKey("quests.id", ondelete="CASCADE"), nullable=True)
    challenge_object = db.Column(db.String(100))  # L'objet du défi
    # True si correspond au défi du jour
    is_challenge_object = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    game_participant_id = db.Column(db.Integer, db.ForeignKey("game_participants.id", ondelete="SET NULL"),nullable=True)


class TrainingAnnotation(db.Model):
    __tablename__ = "training_annotations"
    id = db.Column(db.Integer, primary_key=True, index=True)
    photo_id = db.Column(db.Integer, db.ForeignKey("photos.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey("quests.id", ondelete="SET NULL"), nullable=True)
    object_name = db.Column(db.String(100), nullable=False)
    bbox = db.Column(db.JSON, nullable=False)
    validated = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())


class Game(db.Model):
    __tablename__ = "games"
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    code = db.Column(db.String(8), unique=True, nullable=False)
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    max_players = db.Column(db.Integer, default=2, nullable=False)
    max_objects = db.Column(db.Integer, default=5, nullable=False)
    mode = db.Column(db.String(50), default="classique", nullable=False)
    filters = db.Column(db.JSON)
    status = db.Column(db.String(50), default="waiting", nullable=False)
    start_timestamp = db.Column(db.DateTime)
    end_timestamp = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    password = db.Column(db.String(50))


class GameObject(db.Model):
    __tablename__ = "game_objects"
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    object_to_find = db.Column(db.String(100), nullable=False)
    order_index = db.Column(db.Integer, default=1, nullable=False)


class GameParticipant(db.Model):
    __tablename__ = "game_participants"
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    join_code = db.Column(db.String(8))
    is_creator = db.Column(db.Boolean, default=False, nullable=False)
    objects_to_find = db.Column(db.JSON, nullable=False)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    lap_times = db.Column(db.JSON, default=list, nullable=False)
    status = db.Column(db.String(20), default="pending", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


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
    challenge_id = db.Column(db.Integer, db.ForeignKey("quests.id", ondelete="CASCADE"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
