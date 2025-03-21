from flask import Flask, request, jsonify
from .crud import (
    get_user, create_user,
    create_quest,
    create_photo,
    create_game, get_game, add_game_object,
    add_friend, get_friends,
    add_reward, get_rewards
)
from .utils import detect_objects
from PIL import Image
from .database import db

def create_routes(app):
    @app.route('/users/', methods=['POST'])
    def create_user_route():
        data = request.get_json()
        user = create_user(db.session, data["username"], data["email"], data["password"])
        return jsonify({"id": user.id, "username": user.username, "email": user.email}), 201

    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user_route(user_id):
        user = get_user(db.session, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"id": user.id, "username": user.username, "email": user.email, "points": user.points})

    @app.route('/quests/', methods=['POST'])
    def create_quest_route():
        data = request.get_json()
        quest = create_quest(db.session, data["name"], data["description"], data["object_to_find"], data["reward_points"])
        return jsonify({"id": quest.id, "name": quest.name, "description": quest.description}), 201

    @app.route('/detect', methods=['POST'])
    def detect_objects_route():
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        image = Image.open(file).convert('RGB')
        detections = detect_objects(image)
        return jsonify({"detections": detections})

    @app.route('/photos/', methods=['POST'])
    def create_photo_route():
        data = request.get_json()
        photo = create_photo(db.session, data["user_id"], data["quest_id"], data["photo_url"])
        return jsonify({"id": photo.id, "photo_url": photo.photo_url}), 201

    @app.route('/games/', methods=['POST'])
    def create_game_route():
        data = request.get_json()
        game = create_game(db.session, data["creator_id"])
        return jsonify({"id": game.id, "creator_id": game.creator_id, "status": game.status}), 201

    @app.route('/games/<int:game_id>', methods=['GET'])
    def get_game_route(game_id):
        game = get_game(db.session, game_id)
        if not game:
            return jsonify({"error": "Game not found"}), 404
        return jsonify({"id": game.id, "creator_id": game.creator_id, "status": game.status})

    @app.route('/game_objects/', methods=['POST'])
    def add_game_object_route():
        data = request.get_json()
        game_object = add_game_object(db.session, data["game_id"], data["object_to_find"])
        return jsonify({"id": game_object.id, "game_id": game_object.game_id, "object_to_find": game_object.object_to_find}), 201

    @app.route('/friends/', methods=['POST'])
    def add_friend_route():
        data = request.get_json()
        friend = add_friend(db.session, data["user_id"], data["friend_id"])
        return jsonify({"id": friend.id, "user_id": friend.user_id, "friend_id": friend.friend_id, "status": friend.status}), 201

    @app.route('/friends', methods=['GET'])
    def get_friends_route():
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        friends = get_friends(db.session, user_id)
        return jsonify([{"id": f.id, "user_id": f.user_id, "friend_id": f.friend_id, "status": f.status} for f in friends])

    @app.route('/rewards/', methods=['POST'])
    def add_reward_route():
        data = request.get_json()
        reward = add_reward(db.session, data["user_id"], data["reward_type"], data["reward_value"])
        return jsonify({"id": reward.id, "user_id": reward.user_id, "reward_type": reward.reward_type, "reward_value": reward.reward_value}), 201

    @app.route('/rewards', methods=['GET'])
    def get_rewards_route():
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        rewards = get_rewards(db.session, user_id)
        return jsonify([{"id": r.id, "user_id": r.user_id, "reward_type": r.reward_type, "reward_value": r.reward_value} for r in rewards])