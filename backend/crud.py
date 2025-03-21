from sqlalchemy.orm import Session
from .models import User, Quest, Photo, Game, GameObject, Friend, Reward

# Utilisateurs
def create_user(db: Session, username: str, email: str, password_hash: str):
    user = User(username=username, email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

# Quêtes
def create_quest(db: Session, name: str, description: str, object_to_find: str, reward_points: int):
    quest = Quest(name=name, description=description, object_to_find=object_to_find, reward_points=reward_points)
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest

# Photos
def create_photo(db: Session, user_id: int, quest_id: int, photo_url: str):
    photo = Photo(user_id=user_id, quest_id=quest_id, photo_url=photo_url)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

# Parties de jeu
def create_game(db: Session, creator_id: int):
    game = Game(creator_id=creator_id)
    db.add(game)
    db.commit()
    db.refresh(game)
    return game

def get_game(db: Session, game_id: int):
    return db.query(Game).filter(Game.id == game_id).first()

def add_game_object(db: Session, game_id: int, object_to_find: str):
    game_object = GameObject(game_id=game_id, object_to_find=object_to_find)
    db.add(game_object)
    db.commit()
    db.refresh(game_object)
    return game_object

# Amis
def add_friend(db: Session, user_id: int, friend_id: int):
    friend = Friend(user_id=user_id, friend_id=friend_id)
    db.add(friend)
    db.commit()
    db.refresh(friend)
    return friend

def get_friends(db: Session, user_id: int):
    return db.query(Friend).filter(Friend.user_id == user_id).all()

# Récompenses
def add_reward(db: Session, user_id: int, reward_type: str, reward_value: str):
    reward = Reward(user_id=user_id, reward_type=reward_type, reward_value=reward_value)
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward

def get_rewards(db: Session, user_id: int):
    return db.query(Reward).filter(Reward.user_id == user_id).all()