from flask import Flask, request, jsonify
from ultralytics import YOLO
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt  # Import pour afficher l'image

app = Flask(__name__)

# Charger le modèle YOLO
model = YOLO("yolo11x.pt")  # Modèle pré-entraîné

# Variable globale pour activer le mode debug
debug = False

@app.route('/detect', methods=['POST'])
def detect_objects():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    # Charger l'image depuis la requête
    file = request.files['file']
    image = Image.open(file).convert('RGB')
    
    if debug:
        # Afficher l'image si debug est activé
        plt.imshow(image)
        plt.title("Image reçue (Mode Debug)")
        plt.axis('off')  # Masquer les axes
        plt.show()

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
    
    return jsonify({"detections": detections})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
