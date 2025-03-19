from flask import Flask, request, jsonify
from .crud import get_user, create_user, create_quest, create_photo
from .database import db
from .models import User, Quest, Photo
from .utils import detect_objects
from PIL import Image

def create_routes(app):
    @app.route("/users/<int:user_id>", methods=["GET"])
    def get_user_route(user_id):
        user = get_user(db.session, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"id": user.id, "username": user.username, "email": user.email})

    @app.route("/users/", methods=["POST"])
    def create_user_route():
        data = request.get_json()
        user = create_user(
            db.session, data["username"], data["email"], "hashed_password")
        return jsonify({"id": user.id, "username": user.username, "email": user.email}), 201

    @app.route("/quests/", methods=["POST"])
    def create_quest_route():
        data = request.get_json()
        quest = create_quest(
            db.session, data["name"], data["description"], data["object_to_find"], data["reward_points"])
        return jsonify({"id": quest.id, "name": quest.name}), 201

    @app.route("/photos/", methods=["POST"])
    def create_photo_route():
        data = request.get_json()
        photo = create_photo(
            db.session, data["user_id"], data["quest_id"], data["photo_url"])
        return jsonify({"id": photo.id, "photo_url": photo.photo_url}), 201

    @app.route('/detect', methods=['POST'])
    def detect_objects_route():
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        # Charger l'image depuis la requête
        file = request.files['file']
        image = Image.open(file).convert('RGB')

        # Analyser l'image avec YOLOv11
        detections = detect_objects(image)

        return jsonify({"detections": detections})
