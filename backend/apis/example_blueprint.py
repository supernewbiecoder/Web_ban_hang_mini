from backend.databases.mongodb import MongoDB
from backend.decorators.auth import optional_auth
from sanic import Blueprint
from sanic.response import json as json_response

example = Blueprint('example_blueprint', url_prefix='/ping')


@example.route('/')
async def bp_root(request):
    #_db.insert_user({"name":"manh"}) thêm thử
    return json_response({"message": "Server is online"})


@example.route('/check-role')
@optional_auth
async def check_role(request):
    """Endpoint mẫu: kiểm tra role của user (guest nếu không đăng nhập)"""
    user_info = getattr(request.ctx, "user", {})
    role = user_info.get("role", "unknown")
    username = user_info.get("username", "anonymous")
    
    return json_response({
        "message": f"Xin chào! Role của bạn: {role}",
        "username": username,
        "role": role
    })


