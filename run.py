from backend import create_app
from backend.routes import create_routes

app = create_app()
create_routes(app)

if __name__ == "__main__":
    app.run(host='::', port=5000, debug=True)