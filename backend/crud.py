from .models import User, Quest, Photo

def get_user(db_session, user_id: int):
    return db_session.query(User).filter(User.id == user_id).first()

def create_user(db_session, username: str, email: str, password_hash: str):
    user = User(username=username, email=email, password_hash=password_hash)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def create_quest(db_session, name: str, description: str, object_to_find: str, reward_points: int):
    quest = Quest(name=name, description=description, object_to_find=object_to_find, reward_points=reward_points)
    db_session.add(quest)
    db_session.commit()
    db_session.refresh(quest)
    return quest

def create_photo(db_session, user_id: int, quest_id: int, photo_url: str):
    photo = Photo(user_id=user_id, quest_id=quest_id, photo_url=photo_url)
    db_session.add(photo)
    db_session.commit()
    db_session.refresh(photo)
    return photo