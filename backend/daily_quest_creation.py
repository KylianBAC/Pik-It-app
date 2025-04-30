import random
from datetime import date
from .models import Quest
from .database import db

OBJECTS_TO_FIND = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck",
    "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench",
    "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
    "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
    "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
    "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl",
    "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza",
    "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet",
    "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven",
    "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
    "hair drier", "toothbrush"
]

def create_daily_quest():
    today = date.today()

    # Vérifie si une quête existe déjà pour aujourd'hui
    existing_quest = Quest.query.filter_by(quest_date=today).first()
    if existing_quest:
        return existing_quest  # Elle existe déjà

    # Sinon, on crée une nouvelle quête
    chosen_object = random.choice(OBJECTS_TO_FIND)
    quest_name = "Quête quotidienne"
    quest_description = f"Ta mission du jour : Prend en photo un(e) {chosen_object} pour gagner des points."

    new_quest = Quest(
        name=quest_name,
        description=quest_description,
        object_to_find=chosen_object,
        reward_points=10,
        quest_date=today
    )
    db.session.add(new_quest)
    db.session.commit()

    return new_quest
