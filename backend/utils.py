from ultralytics import YOLO
from PIL import Image
import numpy as np
import os
from werkzeug.utils import secure_filename


# Charger le modèle YOLO
model = YOLO("yolo11x.pt")  # Modèle pré-entraîné

def detect_objects(image):
    """
    Analyse une image avec YOLOv11 et retourne les détections.
    :param image: Image PIL
    :return: Liste des détections
    """
    # Convertir l'image en numpy array
    img_array = np.array(image)

    # Effectuer la détection
    results = model(img_array)

    # Récupérer les noms des classes
    class_names = results[0].names  # Dictionnaire {class_id: "class_name"}

    # Traiter les résultats
    detections = []
    for result in results[0].boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = result
        detections.append({
            "class_id": int(class_id),
            "name": class_names[int(class_id)],  # Associer le class_id à un nom
            "score": float(score),
            "box": [x1, y1, x2, y2]
        })

    return detections