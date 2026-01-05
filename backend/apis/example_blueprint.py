from backend.databases.mongodb import MongoDB
from sanic import Blueprint, text

example = Blueprint('example_blueprint', url_prefix='/ping')


@example.route('/')
async def bp_root(request):
    #_db.insert_user({"name":"manh"}) thêm thử
    return text("Server is online")


