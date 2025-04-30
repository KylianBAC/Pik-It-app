from flask import Flask
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from .database import db  # Importez comme avant

# Charge les variables d'environnement (.env)
load_dotenv()

# Initialisation des extensions
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    # Configuration existante (PostgreSQL)
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Nouvelle configuration JWT
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY", "clé_par_défaut_dev")  # Fallback si .env manquant
    # Tokens sans expiration (à ajuster en prod)
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

    # Initialisation des extensions
    db.init_app(app)
    jwt.init_app(app)  # <-- Ajoutez cette ligne

    with app.app_context():
        db.create_all()

    return app
