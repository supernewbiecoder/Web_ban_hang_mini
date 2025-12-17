from sanic import Blueprint, text

example = Blueprint('example_blueprint', url_prefix='/ping')

@example.route('/')
async def bp_root(request):
    return text("Server is online")