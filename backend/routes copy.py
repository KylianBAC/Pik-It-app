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
from datetime import datetime
import uuid
import random
from .crud import (
    get_user, get_user_by_username, create_user,
    get_all_quests, get_quest_by_date, get_quest_by_id,
    create_photo, get_photos_by_user, get_photo_by_id,
    get_detections_by_photo_id,
    create_game, update_game, get_game, get_game_by_code,
    add_game_object, list_game_objects,
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

# Registered Users requests

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

    @app.route('/games/<int:game_id>', methods=['PUT'])
    @jwt_required()
    def modify_game(game_id):
        uid = int(get_jwt_identity())
        data = request.get_json() or {}
        game = get_game(db.session, game_id)
        if not game:
            return jsonify(error='Game not found'), 404
        # Seul le créateur peut modifier
        if game.creator_id != uid:
            return jsonify(error='Unauthorized'), 403
        # Mise à jour
        updated = update_game(
            db.session,
            game_id=game_id,
            max_players=data.get('max_players'),
            max_objects=data.get('max_objects'),
            mode=data.get('mode'),
            filters=data.get('filters'),
            is_public=data.get('is_public'),
            password=data.get('password')
        )
        if not updated:
            return jsonify(error='Update failed'), 400
        return jsonify({
            'game_id': updated.id,
            'max_players': updated.max_players,
            'max_objects': updated.max_objects,
            'mode': updated.mode,
            'filters': updated.filters,
            'is_public': updated.is_public,
            'password': updated.password
        }), 200

    @app.route('/games/<int:game_id>/start', methods=['PUT'])
    @jwt_required()
    def start_game(game_id):
        uid = int(get_jwt_identity())
        game = get_game(db.session, game_id)

        if not game:
            return jsonify(error='Game not found'), 404

        # Seul le créateur peut démarrer la partie
        if game.creator_id != uid:
            return jsonify(error='Only the owner can start the game'), 403

        if game.status == "in_progress":
            return jsonify(error='The game has already started'), 400

        # Initialise start_time de tous les participants
        participants = list_participants(db.session, game_id)
        now = datetime.utcnow()
        for p in participants:
            p.start_time = now
            p.status = 'in_progress'
        db.session.commit()

        # Génère la liste d'objets à trouver
        OBJECT_POOL = [
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

        selection = random.sample(OBJECT_POOL, k=game.max_objects)
        for idx, name in enumerate(selection, start=1):
            add_game_object(db.session, game_id, name, order_index=idx)

        # 4) Prépare le JSON structuré pour les participants
        objects_payload = [
            { "order_index": idx+1, "objectname": name, "found": False, "skipped": False }
            for idx, name in enumerate(selection)
        ]
        # Initialise start_time et objets pour chaque participant
        participants = list_participants(db.session, game_id)
        now = datetime.utcnow()
        for p in participants:
            update_participant_status_and_start(
                db.session, p.id, now, status='in_progress')
            update_participant_objects(db.session, p.id, objects_payload)

        updated = update_game(
            db.session,
            game_id=game_id,
            status='in_progress'
        )

        return jsonify(message='Game started', game_id=game_id), 200

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

    # Récupérer par game_id
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
            "created_at": game.created_at.isoformat() if game.created_at else None,
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
                "detections": detection_entries
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
        unique_name = f"{current_user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex}{ext}"

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