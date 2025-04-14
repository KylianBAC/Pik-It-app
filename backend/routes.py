from flask import Flask, request, jsonify
from flask_jwt_extended import (
    jwt_required, create_access_token,
    get_jwt_identity, verify_jwt_in_request
)
from flask import current_app  # Pour obtenir le chemin racine de l'app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
from .crud import (
    get_user, get_user_by_username, create_user,
    get_all_quests, get_quest_by_date, get_quest_by_id,
    create_photo, get_photos_by_user, get_photo_by_id,
    get_detections_by_photo_id,
    create_game, get_game, add_game_object,
    add_friend, get_friends,
    add_reward, get_rewards, create_detection
)
from .daily_quest_creation import create_daily_quest
from .utils import detect_objects
from PIL import Image
from .database import db
import os

def create_routes(app):
    @app.route('/user/register', methods=['POST'])
    def register():
        data = request.get_json()
        hashed_pw = generate_password_hash(data['password'])
        user = create_user(db.session, data['username'], data['email'], hashed_pw)
        return jsonify({"id": user.id, "username": user.username}), 201

    @app.route('/user/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = get_user_by_username(db.session, data['username'])
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'username': user.username,
                'role': 'player' 
            }
        )
        return jsonify(access_token=access_token), 200

    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user_route(user_id):
        user = get_user(db.session, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"id": user.id, "username": user.username, "points": user.points})
    

    @app.route('/admin/create_daily_quest', methods=['POST'])
    def create_daily_quest_endpoint():
        # Vérifie un token secret dans les headers (à définir dans config/env)
        token = request.headers.get("X-ADMIN-TOKEN")
        if token != os.environ.get("ADMIN_SECRET"):
            return jsonify({"error": "Unauthorized"}), 403

        quest = create_daily_quest()
        return jsonify({
            "id": quest.id,
            "name": quest.name,
            "description": quest.description,
            "object_to_find": quest.object_to_find,
            "quest_date": quest.quest_date.isoformat()
        }), 201

    @app.route('/quests', methods=['GET'])
    def fetch_all_quests():
        quests = get_all_quests()
        quests_data = [{
            "id": q.id,
            "name": q.name,
            "description": q.description,
            "object_to_find": q.object_to_find,
            "reward_points": q.reward_points,
            "quest_date": q.quest_date.isoformat() if q.quest_date else None
        } for q in quests]
        return jsonify(quests_data), 200

    @app.route('/quests/<string:quest_date>', methods=['GET'])
    def fetch_quest_by_date(quest_date):
        try:
            date_obj = datetime.strptime(quest_date, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Format de date invalide. Utilise YYYY-MM-DD"}), 400

        quest = get_quest_by_date(date_obj)
        if not quest:
            return jsonify({"message": "Aucune quête trouvée pour cette date."}), 404

        quest_data = {
            "id": quest.id,
            "name": quest.name,
            "description": quest.description,
            "object_to_find": quest.object_to_find,
            "reward_points": quest.reward_points,
            "quest_date": quest.quest_date.isoformat()
        }
        return jsonify(quest_data), 200

    @app.route('/quests/id/<int:quest_id>', methods=['GET'])
    def fetch_quest_by_id(quest_id):
        quest = get_quest_by_id(quest_id)
        if not quest:
            return jsonify({"message": "Aucune quête trouvée pour cet ID."}), 404

        quest_data = {
            "id": quest.id,
            "name": quest.name,
            "description": quest.description,
            "object_to_find": quest.object_to_find,
            "reward_points": quest.reward_points,
            "quest_date": quest.quest_date.isoformat()
        }
        return jsonify(quest_data), 200

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

# Get detections by photo
    @app.route('/photos/detections/<int:photo_id>', methods=['GET'])
    @jwt_required()
    def get_detections_by_photo(photo_id):
        detections = get_detections_by_photo_id(photo_id)
        detections_data = [{
            "id": d.id,
            "photo_id": d.photo_id,
            "object_name": d.object_name,
            "confidence": d.confidence,
            "bbox": d.bbox,
            "challenge_object": d.challenge_object,
            "is_challenge_object": d.is_challenge_object,
            "created_at": d.created_at
        } for d in detections]

        return jsonify(detections_data), 200


# Registered Users requests

# Get user data
    @app.route('/users/me', methods=['GET'])
    @jwt_required()
    def get_user_me_route():
        current_user_id = get_jwt_identity()
        user_id = current_user_id
        user = get_user(db.session, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"id": user.id, "username": user.username, "email": user.email, "created_at": user.created_at, "points": user.points})
    
# Upload photo
    @app.route('/photos/', methods=['POST'])
    @jwt_required()
    def create_photo_route():
        current_user_id = get_jwt_identity()
        # Vérifiez que l'upload du fichier est présent dans la requête
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        # Vérifier que le fichier possède un nom valide
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        # Sécuriser le nom du fichier
        filename = secure_filename(file.filename)

        # Définir le chemin complet vers le dossier uploads dans static
        uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        # Crée le dossier uploads s'il n'existe pas déjà
        os.makedirs(uploads_dir, exist_ok=True)
        
        save_path = os.path.join(uploads_dir, filename)
        file.save(save_path)

        # Construire l'URL relative à la racine du serveur
        file_url = f"/static/uploads/{filename}"

        # Sauvegarde en BDD de l'URL de la photo (image_url)
        photo = create_photo(db.session, file_path=file_url, user_id=current_user_id)
        return jsonify({"id": photo.id, "file_path": photo.file_path}), 201

# Upload and detect photo
    @app.route('/photos/detect', methods=['POST'])
    @jwt_required()
    def detect_and_save_photo():
        current_user_id = get_jwt_identity()

        if 'file' not in request.files:
            return jsonify({"error": "Aucun fichier envoyé"}), 400

        file = request.files['file']
        if file.filename == "":
            return jsonify({"error": "Nom de fichier vide"}), 400

        filename = secure_filename(file.filename)
        uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, filename)
        file.save(file_path)

        file_url = f"/static/uploads/{filename}"
        image = Image.open(file_path).convert('RGB')

        photo = create_photo(db.session, file_path=file_url, user_id=current_user_id, is_analysed=True)

        detections = detect_objects(image)

        challenge_id = request.form.get("challenge_id")
        challenge_object = None
 
        if challenge_id is not None:
            try:
                challenge_id = int(challenge_id)
            except ValueError:
                return jsonify({"error": "challenge_id doit être un entier"}), 400

            # Requête interne pour récupérer le challenge via son ID
            with current_app.test_client() as client:
                response = client.get(f"/quests/id/{challenge_id}")
                if response.status_code != 200:
                    return jsonify({"error": "Challenge introuvable"}), 404
                challenge_data = response.get_json()
                challenge_object = challenge_data.get("object_to_find")

        detection_entries = []
        for det in detections:
            is_challenge = challenge_object and det["name"].lower() == challenge_object.lower()
            entry = create_detection(
                db.session,
                photo_id=photo.id,
                object_name=det["name"],
                confidence=det["score"],
                bbox={"box": det["box"]},
                challenge_object=challenge_object,
                is_challenge_object=is_challenge,
                challenge_id=challenge_id
            )
            detection_entries.append({
                "id": entry.id,
                "object_name": entry.object_name,
                "confidence": entry.confidence,
                "bbox": entry.bbox,
                "challenge_object": entry.challenge_object,
                "is_challenge_object": entry.is_challenge_object,
                "challenge_id": entry.challenge_id
            })
        return jsonify({
            "photo": {"id": photo.id, "file_path": photo.file_path},
            "detections": detection_entries
        }), 201


# Complete a quest
    @app.route('/quests/complete', methods=['POST'])
    @jwt_required()
    def complete_challenge():
        data = request.get_json()
        # On attend par exemple un payload JSON contenant :
        # - "photo_id" : l'identifiant de la photo du challenge
        # - "challenge_id": l'id de la quête à compléter
        # - éventuellement d'autres éléments de vérification
        photo_id = data.get("photo_id")
        challenge_id = data.get("challenge_id")
        user_id = get_jwt_identity()

        if not photo_id or not challenge_id:
            return jsonify({"error": "photo_id et challenge_id sont requis"}), 400
        else :
            # Requête interne pour récupérer le challenge via son ID
            with current_app.test_client() as client:
                response = client.get(f"/quests/id/{challenge_id}")
                if response.status_code != 200:
                    return jsonify({"error": "Challenge introuvable"}), 404
                challenge_data = response.get_json()
                challenge_name = challenge_data.get("name")
                reward_points = challenge_data.get("reward_points")
        # Ici, vous devez ajouter la logique pour vérifier que la photo contient bien
        # la détection attendue par la quête (par exemple, en consultant les détections)
        detections = get_detections_by_photo_id(photo_id)
        # Vous pouvez ajouter la logique de validation, par exemple :
        valid = False
        for d in detections:
            if d.challenge_id == challenge_id and d.is_challenge_object:
                valid = True
                break

        if not valid:
            return jsonify({"error": "Challenge non complété ou détection non valide"}), 400

    
        # Si le challenge est complété, vous attribuez la récompense
        reward = add_reward(db.session, user_id, reward_type=challenge_name, reward_value=reward_points, challenge_id=challenge_id)

        # Vous pouvez aussi mettre à jour le statut de la photo ou de la quête si besoin
        return jsonify({
            "message": "Challenge complété avec succès",
            "reward": {
                "id": reward.id,
                "reward_type": reward.reward_type,
                "reward_value": reward.reward_value,
                "challenge_id": reward.challenge_id
            }
        }), 200


# Get user photos
    @app.route('/photos/me', methods=['GET'])
    @jwt_required()
    def fetch_user_photos():
        current_user_id = get_jwt_identity()
        user_id = current_user_id
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        photos = get_photos_by_user(user_id)
        photos_data = [{
            "id": p.id,
            "file_path": p.file_path,
            "upload_date": p.upload_date.isoformat() if p.upload_date else None,
            "is_analysed": p.is_analysed
        } for p in photos]

        return jsonify(photos_data), 200

    @app.route('/photos/me/<int:photo_id>', methods=['GET'])
    @jwt_required()
    def fetch_single_photo(photo_id):
        current_user_id = get_jwt_identity()
        user_id = current_user_id
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        photo = get_photo_by_id(photo_id, user_id)
        if not photo:
            return jsonify({"error": "Photo not found"}), 404

        photo_data = {
            "id": photo.id,
            "file_path": photo.file_path,
            "upload_date": photo.upload_date.isoformat() if photo.upload_date else None,
            "is_analysed": photo.is_analysed
        }

        return jsonify(photo_data), 200

# Host a game
    @app.route('/games/host', methods=['POST'])
    @jwt_required() 
    def create_game_route():
        current_user_id = get_jwt_identity()
        game = create_game(db.session, creator_id=current_user_id)
        return jsonify({"id": game.id, "creator_id": game.creator_id, "status": game.status}), 201