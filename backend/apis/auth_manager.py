from backend.databases.mongodb import MongoDB
from backend.databases.user_collection import UserRepository
from backend.models.user import User, register_user_schema, login_user_schema
from backend.utils.jwt import generate_jwt
from sanic import Blueprint
from sanic.response import json
from jsonschema import validate, ValidationError
from backend.constants import enum
auth = Blueprint('auth', url_prefix='/auth')

_db = MongoDB()
_user_repo = UserRepository(_db)

@auth.post('/register')
async def register(request):
    data = request.json or {}
    # Validate payload (username + password only)
    try:
        validate(instance=data, schema=register_user_schema)
    except ValidationError as e:
        return json({"error": "Payload không hợp lệ", "details": e.message}, status=400)

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return json({"error": "yêu cầu Username và password"}, status=400)

    # Check duplicate
    if _user_repo.get_user_by_username(username):
        return json({"error": "Username đã tồn tại"}, status=409)
    # Create user and insert
    cur_user = User(username=username, password=password,role=enum.User_Role.USER,status=enum.User_Status.ACTIVE) #tạo bằng cái này thì chỉ tạo ra role user
    _user_repo.insert_user(cur_user.to_dict())

    return json({"message": "Đăng ký thành công"}, status=201)


@auth.post('/login')
async def login(request):
    data = request.json or {}
    # Basic validation for login
    try:
        validate(instance=data, schema=login_user_schema)
    except ValidationError as e:
        return json({"error": "Payload không hợp lệ", "details": e.message}, status=400)

    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = _user_repo.get_user_by_username(username)
    if not user:
        return json({"error": "không tồn tại tài khoản"}, status=401)

    # Verify password against stored hash
    
    if user["password"] != password:
        return json({"error": "Sai tài khoản hoặc mật khẩu"}, status=401)
    
    role=user["role"]

    token = generate_jwt(username,role)
    return json({"access_token": token, "token_type": "Bearer"})


