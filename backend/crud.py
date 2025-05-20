from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm.attributes import flag_modified
from .models import User, Quest, Photo, Game, GameObject, GameParticipant, Friend, Reward, Detection, TrainingAnnotation
from datetime import date
import uuid

# Utilisateurs


def create_user(db: Session, username: str, email: str, password_hash: str):
    user = User(username=username, email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# Quêtes


def get_all_quests():
    return Quest.query.order_by(Quest.quest_date.desc()).all()


def get_quest_by_date(target_date: date):
    return Quest.query.filter_by(quest_date=target_date).first()


def get_quest_by_id(target_id: int):
    return Quest.query.filter_by(id=target_id).first()

# Photos


def create_photo(db: Session, user_id: int, file_path: str, is_analysed: bool):
    photo = Photo(user_id=user_id, file_path=file_path,
                  is_analysed=is_analysed)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def get_photos_by_user(user_id: int):
    return Photo.query.filter_by(user_id=user_id).order_by(Photo.upload_date.desc()).all()


def get_photo_by_id(photo_id: int, user_id: int):
    return Photo.query.filter_by(id=photo_id, user_id=user_id).first()


def create_detection(db: Session, photo_id: int, object_name: str, confidence: float, bbox: dict,
                     challenge_object: str, is_challenge_object: bool, challenge_id: int = None, game_participant_id: int = None):
    detection = Detection(
        photo_id=photo_id,
        object_name=object_name,
        confidence=confidence,
        bbox=bbox,
        challenge_object=challenge_object,
        is_challenge_object=is_challenge_object,
        challenge_id=challenge_id,
        game_participant_id=game_participant_id
    )
    db.add(detection)
    db.commit()
    db.refresh(detection)
    return detection


def get_detections_by_photo_id(photo_id: int):
    return Detection.query.filter_by(photo_id=photo_id).all()

# --- Parties de jeu ---

def create_game(db: Session, creator_id: int,
                max_players: int = 4,
                max_objects: int = 5,
                mode: str = 'classique',
                filters: dict = None,
                is_public: bool = True,
                password: str = None):
    code = uuid.uuid4().hex[:6]
    game = Game(
        creator_id=creator_id,
        code=code,
        max_players=max_players,
        max_objects=max_objects,
        mode=mode,
        filters=filters,
        is_public=is_public,
        password=password
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    return game

def update_game(
    db: Session,
    game_id: int,
    status: str = None,
    max_players: int = None,
    max_objects: int = None,
    mode: str = None,
    filters: dict = None,
    is_public: bool = None,
    password: str = None
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        return None
    if status is not None:
        game.status = status
    if max_players is not None:
        game.max_players = max_players
    if max_objects is not None:
        game.max_objects = max_objects
    if mode is not None:
        game.mode = mode
    if filters is not None:
        game.filters = filters
    if is_public is not None:
        game.is_public = is_public
    if password is not None:
        game.password = password
    db.commit()
    db.refresh(game)
    return game


def get_game(db: Session, game_id: int):
    return db.query(Game).filter(Game.id == game_id).first()


def get_game_by_code(db: Session, code: str):
    return db.query(Game).filter(Game.code == code).first()


def add_game_object(db: Session, game_id: int, object_to_find: str, order_index: int):
    obj = GameObject(game_id=game_id, object_to_find=object_to_find, order_index=order_index)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def list_game_objects(db: Session, game_id: int):
    return db.query(GameObject).filter_by(game_id=game_id).order_by(GameObject.order_index).all()


# Participants

def add_participant(db: Session, game_id: int, user_id: int, is_creator: bool = False):
    join_code = uuid.uuid4().hex[:8]
    # fetch object list from game
    objects = [obj.object_to_find for obj in list_game_objects(db, game_id)]
    participant = GameParticipant(
        game_id=game_id,
        user_id=user_id,
        join_code=join_code,
        is_creator=is_creator,
        objects_to_find=objects,
        start_time=None,
        end_time=None,
        lap_times=[],
        status='pending'
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def list_participants(db: Session, game_id: int):
    return db.query(GameParticipant).filter_by(game_id=game_id).all()


def get_participant(db: Session, participant_id: int):
    return db.query(GameParticipant).filter_by(id=participant_id).first()

def update_participant_objects(db: Session, participant_id: int, objects: list[dict]):
    participant = db.query(GameParticipant).filter(GameParticipant.id == participant_id).first()
    if not participant:
        return None
    participant.objects_to_find = objects
    flag_modified(participant, "objects_to_find")
    db.commit()
    db.refresh(participant)
    return participant

def update_participant_status_and_start(db: Session, participant_id: int, start_time, status: str = 'in_progress'):
    participant = db.query(GameParticipant).filter(GameParticipant.id == participant_id).first()
    if not participant:
        return None
    participant.start_time = start_time
    participant.status = status
    db.commit()
    db.refresh(participant)
    return participant


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


def add_reward(db: Session, user_id: int, reward_type: str, reward_value: str, challenge_id: int = None):
    reward = Reward(
        user_id=user_id,
        reward_type=reward_type,
        reward_value=reward_value,
        challenge_id=challenge_id  # Nouveau paramètre
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward


def get_rewards(db: Session, user_id: int):
    return db.query(Reward).filter(Reward.user_id == user_id).all()

# Entrainement de l'IA (annotations)


def create_annotation(db: Session, photo_id: int, user_id: int,
                      object_name: str, bbox: dict, challenge_id: int = None):
    ann = TrainingAnnotation(
        photo_id=photo_id,
        user_id=user_id,
        challenge_id=challenge_id,
        object_name=object_name,
        bbox=bbox
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann


def get_annotations_by_user(db: Session, user_id: int):
    return db.query(TrainingAnnotation).filter_by(user_id=user_id).all()


def get_annotations_by_photo(db: Session, user_id: int, photo_id: int):
    return db.query(TrainingAnnotation).filter_by(user_id=user_id, photo_id=photo_id).all()
