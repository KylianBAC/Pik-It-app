import os
import shutil
from PIL import Image
from backend import create_app
from backend.database import db
from backend.models import TrainingAnnotation, Photo
import json

# === Paramètres ===
EXPORT_ROOT = "datasets/training_data"
IMAGE_DIR = os.path.join(EXPORT_ROOT, "images")
LABEL_DIR = os.path.join(EXPORT_ROOT, "labels")
YOLO_CLASSES = {}  # mapping: object_name -> class_id


def ensure_dirs():
    os.makedirs(IMAGE_DIR, exist_ok=True)
    os.makedirs(LABEL_DIR, exist_ok=True)


def normalize_bbox(box, width, height):
    """Convert [x1, y1, x2, y2] to YOLO format and normalize."""
    x1, y1, x2, y2 = box
    x_center = (x1 + x2) / 2.0 / width
    y_center = (y1 + y2) / 2.0 / height
    bbox_width = (x2 - x1) / width
    bbox_height = (y2 - y1) / height
    return x_center, y_center, bbox_width, bbox_height


def export_annotations():
    app = create_app()
    with app.app_context():
        ensure_dirs()

        annotations = TrainingAnnotation.query.filter_by(validated=True).all()

        if not annotations:
            print("Aucune annotation validée trouvée.")
            return

        # Génère mapping class_name -> id
        all_classes = sorted({a.object_name for a in annotations})
        for idx, name in enumerate(all_classes):
            YOLO_CLASSES[name] = idx

        print(f"Classes détectées : {YOLO_CLASSES}")

        # Fichier YAML d'entraînement
        with open("datasets/data.yaml", "w") as f:
            f.write(f"train: {os.path.abspath(IMAGE_DIR)}\n")
            f.write(f"val: {os.path.abspath(IMAGE_DIR)}\n")  # ou ajouter val séparé plus tard
            f.write(f"nc: {len(YOLO_CLASSES)}\n")
            f.write(f"names: {list(YOLO_CLASSES.keys())}\n")

        for ann in annotations:
            photo = Photo.query.get(ann.photo_id)
            if not photo:
                continue

            # Obtenir chemin absolu vers image
            image_rel_path = photo.file_path.lstrip("/")  # ex: static/uploads/abc.jpg
            source_path = os.path.join(os.getcwd(), image_rel_path)

            if not os.path.isfile(source_path):
                print(f"[⚠] Image introuvable: {source_path}")
                continue

            # Copie image
            dest_img_path = os.path.join(IMAGE_DIR, os.path.basename(source_path))
            shutil.copyfile(source_path, dest_img_path)

            # Lire taille image
            with Image.open(source_path) as img:
                width, height = img.size

            # Calculer bbox normalisée
            box = ann.bbox.get("box")
            if not box or len(box) != 4:
                print(f"[⚠] Annotation invalide ID={ann.id} : bbox incorrect")
                continue

            yolo_bbox = normalize_bbox(box, width, height)
            class_id = YOLO_CLASSES[ann.object_name]

            # Écrire dans .txt
            label_file = os.path.join(LABEL_DIR, os.path.splitext(os.path.basename(source_path))[0] + ".txt")
            with open(label_file, "a") as f:
                f.write(f"{class_id} {' '.join([str(round(v, 6)) for v in yolo_bbox])}\n")

        print("✅ Export terminé.")
