from sanic import Sanic
from sanic.response import text
from sanic_cors import CORS
from config import Config
from backend.apis import api
app = Sanic(Config.APP_NAME)

app.config.DEBUG = Config.DEBUG
app.config.SECRET = Config.SECRET_KEY

# Enable CORS
CORS(app, origins=Config.CORS_ORIGINS if Config.CORS_ORIGINS else "*")

app.blueprint(api)

@app.get("/")
async def hello_world(request):
    return text("Hello, world.")

if __name__ == "__main__":
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG,
        auto_reload=True
    )