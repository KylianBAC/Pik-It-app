from flask import Flask, request, jsonify
from flask_jwt_extended import (
    jwt_required, create_access_token,
    get_jwt_identity, verify_jwt_in_request
)
from flask import current_app  # Pour obtenir le chemin racine de l'app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import uuid
import uuid
from datetime import datetime, timezone
import uuid
import random
from .crud import (
    get_user, get_user_by_username, create_user,
    get_all_quests, get_quest_by_date, get_quest_by_id,
    create_photo, get_photos_by_user, get_photo_by_id,
    get_detections_by_photo_id,
    create_game, update_game, get_game, get_game_by_code,
    add_game_object, get_object_list_by_name, get_objects_from_list, create_object_list, update_object_list,
    add_participant, get_participant, list_participants, update_participant_status_and_start, update_participant_objects,
    add_friend, get_friends,
    add_reward, get_rewards, create_detection,
    create_annotation, get_annotations_by_user, get_annotations_by_photo,
    update_user_stats, calculate_user_streak, get_user_statistics
)
from .daily_quest_creation import create_daily_quest
from .utils import detect_objects
from PIL import Image
from .database import db
from .models import Reward
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import timedelta
import os


def create_routes(app):
    @app.route('/user/register', methods=['POST'])
    def register():
        data = request.get_json()
        hashed_pw = generate_password_hash(data['password'])
        user = create_user(
            db.session, data['username'], data['email'], hashed_pw)
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
        return jsonify({"id": user.id, "username": user.username, "points": user.total_points})
    
    @app.route('/users/stats', methods=['GET'])
    @jwt_required()
    def get_user_stats():
        """Récupère les statistiques de l'utilisateur connecté"""
        user_id = get_jwt_identity()
        stats = get_user_statistics(db.session, user_id)
        
        if not stats:
            return jsonify({"error": "Utilisateur introuvable"}), 404
        
        return jsonify(stats), 200

    @app.route('/users/profile', methods=['GET'])
    @jwt_required()
    def get_user_profile():
        """Récupère le profil complet de l'utilisateur avec stats récentes"""
        user_id = get_jwt_identity()
        user = get_user(db.session, user_id)
        
        if not user:
            return jsonify({"error": "Utilisateur introuvable"}), 404
        
        # Récupérer les récompenses récentes
        recent_rewards = get_rewards(db.session, user_id)[-10:]  # 10 dernières
        
        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "total_points": user.total_points,
                "total_coins": user.total_coins,
                "current_streak": user.current_streak,
                "longest_streak": user.longest_streak,
                "challenges_completed": user.challenges_completed,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            },
            "recent_rewards": [{
                "id": r.id,
                "reward_type": r.reward_type,
                "reward_value": r.reward_value,
                "created_at": r.created_at
            } for r in recent_rewards]
        }), 200

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
    
    @app.route('/rewards/claim', methods=['POST'])
    @jwt_required()
    def claim_reward():
        data = request.get_json()
        user_id = get_jwt_identity()
        challenge_id = data.get("challenge_id")
        
        if not challenge_id:
            return jsonify({"error": "challenge_id requis"}), 400
        
        # Trouver la récompense du jour pour ce défi
        reward = db.session.query(Reward).filter_by(
            user_id=user_id,
            challenge_id=challenge_id
        ).filter(
            func.date(Reward.created_at) == func.date(datetime.now(timezone.utc))
        ).first()
        
        if not reward:
            return jsonify({"error": "Aucune récompense à réclamer"}), 404
        
        # Marquer comme réclamée (si vous ajoutez un champ 'claimed' à votre modèle)
        # reward.claimed = True
        # db.session.commit()
        
        return jsonify({
            "message": "Récompense réclamée avec succès !",
            "reward_id": reward.id
        }), 200

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
        reward = add_reward(
            db.session, data["user_id"], data["reward_type"], data["reward_value"])
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
        return jsonify({"id": user.id, "username": user.username, "email": user.email, "created_at": user.created_at, "points": user.total_points})

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

        ext = os.path.splitext(secure_filename(file.filename))[1]
        unique_name = f"{current_user_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex}{ext}"

        uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)

        save_path = os.path.join(uploads_dir, unique_name)
        file.save(save_path)

        file_url = f"/static/uploads/{unique_name}"
        file_url = f"/static/uploads/{unique_name}"

        # Sauvegarde en BDD de l'URL de la photo (image_url)
        photo = create_photo(db.session, file_path=file_url,
                             user_id=current_user_id, is_analysed=False)
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

        ext = os.path.splitext(secure_filename(file.filename))[1]
        unique_name = f"{current_user_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex}{ext}"

        ext = os.path.splitext(secure_filename(file.filename))[1]
        unique_name = f"{current_user_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex}{ext}"

        uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, unique_name)
        file_path = os.path.join(uploads_dir, unique_name)
        file.save(file_path)

        file_url = f"/static/uploads/{unique_name}"
        file_url = f"/static/uploads/{unique_name}"
        image = Image.open(file_path).convert('RGB')

        photo = create_photo(db.session, file_path=file_url,
                             user_id=current_user_id, is_analysed=True)

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
            is_challenge = challenge_object and det["name"].lower(
            ) == challenge_object.lower()
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
            "detections": detection_entries,
            "challenge_completed": any(det["is_challenge_object"] for det in detection_entries)
        }), 201

    @app.route('/annotations/submit', methods=['POST'])
    @jwt_required()
    def submit_annotation():
        data = request.get_json()
        user_id = get_jwt_identity()

        photo_id = data.get("photo_id")
        object_name = data.get("object_name")
        # on attend un dict { "box": [x1, y1, x2, y2] }
        bbox = data.get("bbox")
        challenge_id = data.get("challenge_id")

        # Vérifications basiques
        if not photo_id or not object_name or not bbox:
            return jsonify({"error": "photo_id, object_name et bbox sont requis"}), 400

        # Vérifier que bbox["box"] est une liste de 4 valeurs
        box = bbox.get("box")
        if not isinstance(box, list) or len(box) != 4:
            return jsonify({"error": "bbox doit contenir une clé 'box' avec 4 valeurs [x1,y1,x2,y2]"}), 400

        try:
            ann = create_annotation(
                db.session,
                photo_id=photo_id,
                user_id=user_id,
                object_name=object_name,
                bbox=bbox,              # on passe directement { "box": [...] }
                challenge_id=challenge_id
            )
        except Exception as e:
            return jsonify({"error": "Erreur lors de la création de l'annotation : " + str(e)}), 500

        return jsonify({
            "id": ann.id,
            "photo_id": ann.photo_id,
            "object_name": ann.object_name,
            "bbox": ann.bbox,
            "challenge_id": ann.challenge_id,
            "created_at": ann.created_at.isoformat()
        }), 201

# Get les annotations de l'utilisateur
    @app.route('/annotations', methods=['GET'])
    @jwt_required()
    def get_user_annotations():
        current_user_id = get_jwt_identity()
        annotations = get_annotations_by_user(
            db.session, user_id=current_user_id)

        result = []
        for ann in annotations:
            result.append({
                "id": ann.id,
                "photo_id": ann.photo_id,
                "object_name": ann.object_name,
                "bbox": ann.bbox,
                "challenge_id": ann.challenge_id,
                "created_at": ann.created_at.isoformat()
            })

        # Vérification basique
        if not result:
            return jsonify({"Aucun résultat": "Aucun résultat pour cet utilisateur"}), 200

        return jsonify(result), 200

# Get les annotations de l'utilisateur pour une photo précise
    @app.route('/annotations/<int:photo_id>', methods=['GET'])
    @jwt_required()
    def get_annotations_for_photo(photo_id):
        current_user_id = get_jwt_identity()
        annotations = get_annotations_by_photo(
            db.session, user_id=current_user_id, photo_id=photo_id)

        result = []
        for ann in annotations:
            result.append({
                "id": ann.id,
                "photo_id": ann.photo_id,
                "object_name": ann.object_name,
                "bbox": ann.bbox,
                "challenge_id": ann.challenge_id,
                "created_at": ann.created_at.isoformat()
            })

         # Vérifications basiques
        if not result:
            return jsonify({"Aucun résultat": "Aucun résultat pour cet utilisateur avec cette photo"}), 200

        return jsonify(result), 200

# Complete a quest
    @app.route('/challenges/complete', methods=['POST'])
    @jwt_required()
    def complete_challenge_mobile():
        """
        Route simplifiée pour compléter un défi depuis l'app mobile
        """
        data = request.get_json()
        user_id = get_jwt_identity()
        
        challenge_id = data.get("challenge_id")
        photo_id = data.get("photo_id")  # Optionnel, pour vérification
        
        if not challenge_id:
            return jsonify({"error": "challenge_id requis"}), 400
        
        # Récupérer les informations du challenge
        quest = get_quest_by_id(challenge_id)
        if not quest:
            return jsonify({"error": "Challenge introuvable"}), 404
        
        # Vérifier si l'utilisateur a déjà complété ce défi aujourd'hui
        existing_reward = db.session.query(Reward).filter_by(
            user_id=user_id,
            challenge_id=challenge_id,
            created_at=func.date(datetime.now(timezone.utc))  # Même jour
        ).first()
        
        if existing_reward:
            return jsonify({"error": "Défi déjà complété aujourd'hui"}), 400
        
        # Si photo_id fourni, vérifier la détection
        if photo_id:
            detections = get_detections_by_photo_id(photo_id)
            valid_detection = any(
                d.challenge_id == challenge_id and d.is_challenge_object 
                for d in detections
            )
            if not valid_detection:
                return jsonify({"error": "Objet requis non détecté dans la photo"}), 400
        
        # Calculer les récompenses
        base_points = quest.reward_points
        base_coins = quest.reward_points // 2  # Exemple : moitié en pièces
        
        # Bonus de streak (optionnel)
        current_streak = calculate_user_streak(db.session, user_id) + 1  # +1 car ce défi va incrémenter
        streak_bonus = min(current_streak * 5, 50)  # Max 50 points de bonus
        
        total_points = base_points + streak_bonus
        total_coins = base_coins
        
        # Créer la récompense
        reward = add_reward(
            db.session, 
            user_id, 
            reward_type=quest.name,
            reward_value=str(total_points),
            challenge_id=challenge_id
        )
        
        # IMPORTANT : Mettre à jour les stats de l'utilisateur
        updated_user = update_user_stats(
            db.session, 
            user_id, 
            points=total_points, 
            coins=total_coins
        )
        
        if not updated_user:
            return jsonify({"error": "Erreur lors de la mise à jour du profil"}), 500
        
        return jsonify({
            "message": "Défi complété avec succès !",
            "reward": {
                "id": reward.id,
                "points": total_points,
                "base_points": base_points,
                "streak_bonus": streak_bonus,
                "coins": total_coins,
                "bonus": f"Défi '{quest.name}' complété !",
                "streak": updated_user.current_streak
            },
            "user_stats": {
                "total_points": updated_user.total_points,
                "total_coins": updated_user.total_coins,
                "current_streak": updated_user.current_streak,
                "challenges_completed": updated_user.challenges_completed
            }
        }), 200


    def calculate_user_rewards(db: Session, user_id: int, quest):
        """
        Fonction helper pour calculer les récompenses et streaks
        """
        # Compter les récompenses consécutives des derniers jours
        recent_rewards = db.query(Reward).filter_by(
            user_id=user_id
        ).filter(
            Reward.created_at >= datetime.now(timezone.utc) - timedelta(days=7)
        ).order_by(Reward.created_at.desc()).all()
        
        # Calculer le streak
        streak = 1
        for i, reward in enumerate(recent_rewards[1:], 1):
            reward_date = reward.created_at.date()
            prev_date = recent_rewards[i-1].created_at.date()
            if (prev_date - reward_date).days == 1:
                streak += 1
            else:
                break
        
        return {
            "streak": streak,
            "total_points": sum(int(r.reward_value) for r in recent_rewards if r.reward_value.isdigit())
        }


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

# Host a new game
    @app.route('/games/host', methods=['POST'])
    @jwt_required()
    def host_game():
        uid = int(get_jwt_identity())
        cfg = request.get_json() or {}
        game = create_game(
            db.session,
            creator_id=uid,
            max_players=cfg.get('max_players', 4),
            max_objects=cfg.get('max_objects', 5),
            mode=cfg.get('mode', 'classique'),
            filters=cfg.get('filters'),
            is_public=cfg.get('is_public', True)
        )
        # creator joins
        is_creator = True
        participant = add_participant(db.session, game.id, uid, is_creator)
        return jsonify(game_id=game.id, code=game.code), 201

    @app.route('/games/id/<int:game_id>', methods=['GET'])
    @jwt_required()
    def get_game_by_id_route(game_id):
        game = get_game(db.session, game_id)
        if not game:
            return jsonify({"error": "Game not found"}), 404

        return jsonify({
            "id": game.id,
            "code": game.code,
            "creator_id": game.creator_id,
            "is_public": game.is_public,
            "max_players": game.max_players,
            "max_objects": game.max_objects,
            "mode": game.mode,
            "filters": game.filters,
            "status": game.status,
            "start_timestamp": game.start_timestamp.isoformat() if game.start_timestamp else None,
            "end_timestamp": game.end_timestamp.isoformat() if game.end_timestamp else None,
            "created_at": game.created_at.isoformat() if game.created_at else None,
        }), 200

    @app.route('/games/<int:game_id>/start', methods=['PUT'])
    @jwt_required()
    def start_game(game_id):
        uid = int(get_jwt_identity())
        data = request.get_json() or {}
        countdown_seconds = data.get('countdown_seconds', 5)  # Par défaut 5 secondes
        list_name = data.get('object_list_name', 'default')  # Nom de la liste à utiliser
        
        game = get_game(db.session, game_id)

        if not game:
            return jsonify(error='Game not found'), 404

        # Seul le créateur peut démarrer la partie
        if game.creator_id != uid:
            return jsonify(error='Only the owner can start the game'), 403

        if game.status == "in_progress":
            return jsonify(error='The game has already started'), 400

        # Calculer le timestamp de démarrage (maintenant + countdown)
        from datetime import datetime, timedelta
        start_timestamp = datetime.utcnow() + timedelta(seconds=countdown_seconds)
        
        # Mettre à jour le statut de la partie à "starting" avec le timestamp
        updated = update_game(
            db.session,
            game_id=game_id,
            status='starting',
            start_timestamp=start_timestamp
        )

        # Récupérer la liste d'objets depuis la base de données
        objects_pool = get_objects_from_list(db.session, list_name)
        
        if not objects_pool:
            # Fallback vers la liste par défaut si la liste demandée n'existe pas
            OBJECT_POOL_FALLBACK = [
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
            objects_pool = OBJECT_POOL_FALLBACK
            return jsonify(error=f'Object list "{list_name}" not found'), 404

        # Vérifier qu'il y a assez d'objets dans la liste
        if len(objects_pool) < game.max_objects:
            return jsonify(error=f'Not enough objects in list "{list_name}". Required: {game.max_objects}, Available: {len(objects_pool)}'), 400

        selection = random.sample(objects_pool, k=game.max_objects)
        for idx, name in enumerate(selection, start=1):
            add_game_object(db.session, game_id, name, order_index=idx)

        # Préparer le JSON structuré pour les participants
        objects_payload = [
            { "order_index": idx+1, "objectname": name, "found": False, "skipped": False }
            for idx, name in enumerate(selection)
        ]
        
        # Initialiser les objets pour chaque participant (sans start_time encore)
        participants = list_participants(db.session, game_id)
        for p in participants:
            p.status = 'ready'  # Statut intermédiaire
            update_participant_objects(db.session, p.id, objects_payload)

        return jsonify(
            message='Game starting countdown initiated', 
            game_id=game_id,
            start_timestamp=start_timestamp.isoformat(),
            countdown_seconds=countdown_seconds,
            object_list_used=list_name,
            selected_objects=selection
        ), 200


    # Nouvelle route pour vérifier et finaliser le démarrage
    @app.route('/games/<int:game_id>/check-start', methods=['GET'])
    @jwt_required()
    def check_game_start(game_id):
        game = get_game(db.session, game_id)
        if not game:
            return jsonify(error='Game not found'), 404
        
        now = datetime.utcnow()
        
        # Si le jeu est en "starting" et que le timestamp est dépassé
        if game.status == "starting" and game.start_timestamp and now >= game.start_timestamp:
            # Démarrer réellement la partie
            participants = list_participants(db.session, game_id)
            actual_start_time = game.start_timestamp  # Utiliser le timestamp prévu
            
            for p in participants:
                update_participant_status_and_start(
                    db.session, p.id, actual_start_time, status='in_progress'
                )
            
            # Mettre à jour le statut du jeu
            update_game(db.session, game_id=game_id, status='in_progress')
            
            return jsonify(
                status='in_progress',
                started=True,
                actual_start_time=actual_start_time.isoformat()
            ), 200
        
        elif game.status == "starting":
            # Encore en attente
            return jsonify(
                status='starting',
                started=False,
                start_timestamp=game.start_timestamp.isoformat() if game.start_timestamp else None,
                seconds_remaining=max(0, int((game.start_timestamp - now).total_seconds())) if game.start_timestamp else 0
            ), 200
        
        elif game.status == "in_progress":
            return jsonify(status='in_progress', started=True), 200
        
        elif game.status == "finished": # Ajouté pour la fin de partie
            # Si le jeu est terminé, calculer le temps restant pour le décompte de 30 secondes
            time_since_finish = (now - game.end_timestamp).total_seconds() if game.end_timestamp else 0
            remaining_countdown = max(0, 30 - int(time_since_finish)) # 30 secondes en dur
            
            return jsonify(
                status='finished',
                started=False, # Le jeu est terminé, pas "en cours de démarrage"
                end_timestamp=game.end_timestamp.isoformat() if game.end_timestamp else None,
                seconds_remaining=remaining_countdown
            ), 200
        
        else:
            return jsonify(status=game.status, started=False), 200

    @app.route('/games/join', methods=['POST'])
    @jwt_required()
    def join_game():
        uid = int(get_jwt_identity())
        data = request.get_json() or {}
        code = data.get('code')
        provided_password = data.get('password')
        game = get_game_by_code(db.session, code)
        if not game:
            return jsonify(error='Game not found'), 404
        if not game.is_public:
            if not provided_password:
                return jsonify(error='Password required to join this private game'), 400
            if provided_password != game.password:
                return jsonify(error='Invalid password'), 401
        current_parts = list_participants(db.session, game.id)
        for p in current_parts :
            if p.user_id == uid :
                print(f"User {uid} is already in the game {game.id} as participant {p.id}")
                return jsonify(game_id=game.id, participant_id=p.id), 201
        if len(current_parts) >= game.max_players:
            return jsonify(error='Game is already full'), 400
        part = add_participant(db.session, game.id, uid)
        print(f"User {uid} joined game {game.id} as participant {part.id}")
        return jsonify(game_id=game.id, participant_id=part.id), 200


    @app.route('/games/<int:game_id>/update', methods=['PUT'])
    @jwt_required()
    def update_game_route(game_id):
        uid = int(get_jwt_identity())
        data = request.get_json() or {}
        
        game = get_game(db.session, game_id)
        if not game:
            return jsonify(error='Game not found'), 404
        
        # Vérifier que l'utilisateur est participant à la partie
        participants = list_participants(db.session, game_id)
        user_participant = next((p for p in participants if p.user_id == uid), None)
        if not user_participant:
            return jsonify(error='You are not a participant in this game'), 403
        
        # Paramètres autorisés à modifier
        allowed_params = {
            'status': data.get('status'),
            'max_players': data.get('max_players'),
            'max_objects': data.get('max_objects'),
            'mode': data.get('mode'),
            'filters': data.get('filters'),
            'is_public': data.get('is_public'),
            'password': data.get('password'),
            'start_timestamp': data.get('start_timestamp')
        }
        
        # Filtrer seulement les paramètres fournis
        update_params = {k: v for k, v in allowed_params.items() if v is not None}
        
        # Traitement spécial pour start_timestamp si fourni
        if 'start_timestamp' in update_params:
            try:
                update_params['start_timestamp'] = datetime.fromisoformat(update_params['start_timestamp'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify(error='Invalid start_timestamp format'), 400
        
        updated_game = update_game(db.session, game_id=game_id, **update_params)
        
        if not updated_game:
            return jsonify(error='Failed to update game'), 500
        
        return jsonify({
            "id": updated_game.id,
            "code": updated_game.code,
            "creator_id": updated_game.creator_id,
            "is_public": updated_game.is_public,
            "max_players": updated_game.max_players,
            "max_objects": updated_game.max_objects,
            "mode": updated_game.mode,
            "filters": updated_game.filters,
            "status": updated_game.status,
            "start_timestamp": updated_game.start_timestamp.isoformat() if updated_game.start_timestamp else None,
            "created_at": updated_game.created_at.isoformat() if updated_game.created_at else None,
            "message": "Game updated successfully"
        }), 200

    # Récupérer par code
    @app.route('/games/code/<string:code>', methods=['GET'])
    @jwt_required()
    def get_game_by_code_route(code):
        game = get_game_by_code(db.session, code)
        if not game:
            return jsonify({"error": "Game not found"}), 404

        return jsonify({
            "id": game.id,
            "code": game.code,
            "creator_id": game.creator_id,
            "is_public": game.is_public,
            "max_players": game.max_players,
            "max_objects": game.max_objects,
            "mode": game.mode,
            "filters": game.filters,
            "status": game.status,
            "created_at": game.created_at.isoformat() if game.created_at else None,
        }), 200

    @app.route('/games/<int:game_id>/participants', methods=['GET'])
    @jwt_required()
    def get_all_participants(game_id):
        # Optionnel : vérifier que l’utilisateur a bien le droit de voir les participants
        current_user = int(get_jwt_identity())
        # Récupération de tous les participants pour la partie
        parts = list_participants(db.session, game_id)

        # Sérialisation manuelle
        result = []
        for p in parts:
            result.append({
                "id": p.id,
                "game_id": p.game_id,
                "user_id": p.user_id,
                "is_creator": p.is_creator,
                "join_code": p.join_code,
                "objects_to_find": p.objects_to_find,    # JSON
                "start_time": p.start_time.isoformat() if p.start_time else None,
                "end_time": p.end_time.isoformat() if p.end_time else None,
                "lap_times": p.lap_times,                # JSON list
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            })

        return jsonify(result), 200

    @app.route('/games/<int:game_id>/objects', methods=['POST'])
    @jwt_required()
    def add_object(game_id):
        data = request.get_json() or {}
        obj = add_game_object(db.session, game_id,
                              data['object'], data['order_index'])
        return jsonify(id=obj.id, object=obj.object_to_find), 201


    @app.route('/games/<int:game_id>/update_status', methods=['PUT'])
    @jwt_required()
    def update_game_status(game_id):
        uid = int(get_jwt_identity())
        data = request.get_json() or {}
        status = data.get('status')
        end_timestamp = data.get('end_timestamp')

        game = get_game(db.session, game_id)
        if not game:
            return jsonify(error='Game not found'), 404
        
        # Optionnel: vérifier si l'utilisateur a le droit de modifier le statut
        # Par exemple, seul le créateur ou un participant peut déclencher la fin
        # Pour l'instant, on permet à tout utilisateur authentifié
        
        if status:
            if status == "finished" and not game.end_timestamp: # S'assurer que end_timestamp n'est défini qu'une seule fois
                # Si le statut passe à "finished" et qu'il n'y a pas encore de end_timestamp, le définir
                # Utiliser le end_timestamp fourni par le client s'il y en a un, sinon datetime.utcnow()
                game_end_timestamp = datetime.fromisoformat(end_timestamp) if end_timestamp else datetime.utcnow()
                update_game(db.session, game_id=game_id, status=status, end_timestamp=game_end_timestamp)
            else:
                update_game(db.session, game_id=game_id, status=status)
            
            return jsonify(message=f"Game {game_id} status updated to {status}"), 200
        
        return jsonify(error="No status provided"), 400
    

    @app.route('/games/detect', methods=['POST'])
    @jwt_required()
    def game_detect():
        current_user_id = int(get_jwt_identity())

        # Champs attendus
        participant_id = request.form.get("participant_id")
        start_time = request.form.get("start_time")
        end_time = request.form.get("end_time")
        # Vérification des champs requis
        print(participant_id, start_time, end_time)

        if not all([participant_id, start_time, end_time]):
            return jsonify({"error": "participant_id, start_time, end_time requis"}), 400

        try:
            participant_id = int(participant_id)
        except ValueError:
            return jsonify({"error": "participant_id invalide"}), 400

        # Recherche du participant
        participant = get_participant(
            db.session, participant_id=participant_id)
        if not participant:
            return jsonify({"error": "Participant introuvable"}), 404

        objects = participant.objects_to_find or []
        lap_times = participant.lap_times or []

        # Trouver le prochain objet non trouvé
        next_object = next((o for o in objects if not o.get("found") and not o.get("skipped")), None)
        if not next_object:
            return jsonify({
                "message": "Tous les objets ont déjà été trouvés.",
                "detections": [] # Retourne une liste vide si tous les objets sont trouvés
            }), 200

        # Vérification de fichier
        if 'file' not in request.files:
            print("test1")
            return jsonify({"error": "Aucun fichier envoyé"}), 400

        file = request.files['file']
        if file.filename == "":
            print("test2")
            return jsonify({"error": "Nom de fichier vide"}), 400

        # Enregistrement de la photo

        ext = os.path.splitext(secure_filename(file.filename))[1]
        unique_name = f"{current_user_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex}{ext}"

        uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, unique_name)
        file.save(file_path)

        file_url = f"/static/uploads/{unique_name}"
        image = Image.open(file_path).convert('RGB')

        photo = create_photo(db.session, file_path=file_url,
                             user_id=current_user_id, is_analysed=True)

        # Détection
        detections = detect_objects(image)

        # Enregistre les détections
        detection_entries = []
        for det in detections:
            is_challenge = next_object["objectname"] and det["name"].lower(
            ) == next_object["objectname"].lower()
            entry = create_detection(
                db.session,
                photo_id=photo.id,
                object_name=det["name"],
                confidence=det["score"],
                bbox={"box": det["box"]},
                challenge_object=next_object["objectname"],
                is_challenge_object=is_challenge,
                game_participant_id=participant_id  # Important ici
            )
            detection_entries.append({
                "id": entry.id,
                "object_name": entry.object_name,
                "confidence": entry.confidence,
                "bbox": entry.bbox,
                "game_participant_id": participant_id
            })

        # Comparaison entre les détections et l’objet attendu
        found_match = any(
            det["object_name"].lower() == next_object["objectname"].lower()
            for det in detection_entries
        )

        if found_match:
            # Marque l'objet comme trouvé
            next_object["found"] = True

            # Ajoute un lap_time
            lap_times.append({
                "order_index": next_object["order_index"],
                "start_time": start_time,
                "end_time": end_time
            })

            # Sauvegarde des objets et lap_times
            participant.objects_to_find = objects
            participant.lap_times = lap_times

            # Vérifie si c'était le dernier objet à trouver
            all_found = all(o.get("found") for o in objects)
            if all_found:
                participant.status = "finished"
                participant.end_time = end_time  # On prend le end_time transmis par l'utilisateur
                
                # Mettre à jour le statut du jeu à "finished"
                game = get_game(db.session, participant.game_id)
                if game and game.status != "finished": # Ne le met à jour que si ce n'est pas déjà fait
                    update_game(db.session, game_id=game.id, status="finished", end_timestamp=datetime.utcnow())

            db.session.commit()

            return jsonify({
                "message": f"Objet {next_object['objectname']} trouvé !",
                "detections": detection_entries,
                "updated_object": next_object,
                "lap_time_added": True,
                "game_finished": all_found
            }), 200


        else:
            return jsonify({
                "message": f"Objet attendu : {next_object['objectname']}. Aucun match détecté.",
                "detections": detection_entries,
                "updated_object": None,
                "lap_time_added": False
            }), 200


    @app.route('/games/skip', methods=['POST'])
    @jwt_required()
    def skip_object():
        uid = int(get_jwt_identity())
        data = request.get_json() or {}
        participant_id = data.get("participant_id")
        order_index   = data.get("order_index")

        p = get_participant(db.session, participant_id)
        if not p or p.user_id != uid:
            return jsonify(error="Participant invalide"), 404

        objects = p.objects_to_find or []
        for o in objects:
            if o["order_index"] == order_index:
                o["skipped"] = True
                break
        else:
            return jsonify(error="Objet non trouvé"), 400

        # **CALL** à la fonction CRUD
        update_participant_objects(db.session, participant_id, objects)

        return jsonify(message=f"Objet #{order_index} skipped"), 200