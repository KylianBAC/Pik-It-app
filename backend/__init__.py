from flask import Flask
from .database import db

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:Kykypgadmin@localhost:5432/pikit_pg_db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()  # Crée les tables si elles n'existent pas

    return app