from functools import wraps
from sanic.response import json
from config import Config
import jwt


def check_token(request):
    """Kiểm tra và decode JWT token"""
    token = request.headers.get("Authorization", "")
    if not token.startswith("Bearer "):
        return False, "Missing or invalid token format"

    token = token.split(" ", 1)[1].strip()

    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return True, payload
    except jwt.ExpiredSignatureError:
        return False, "Token expired"
    except jwt.InvalidTokenError:
        return False, "Invalid token"


def token_required(handler):
    """Decorator yêu cầu JWT token"""
    @wraps(handler)
    async def decorated_function(request, *args, **kwargs):
        is_authenticated, result = check_token(request)

        if not is_authenticated:
            return json({"error": result}, status=401)

        # LƯU Ý: Lưu toàn bộ payload vào request.ctx.user, không chỉ username
        request.ctx.user = result  # Lưu cả dictionary payload
        return await handler(request, *args, **kwargs)

    return decorated_function


def require_role(*roles):
    """Decorator yêu cầu role cụ thể"""
    def decorator(handler):
        @wraps(handler)
        async def wrapper(request, *args, **kwargs):
            # Lấy thông tin user từ request context
            user_payload = getattr(request.ctx, "user", None)
            
            if not user_payload:
                return json({"error": "Unauthorized"}, status=401)

            # Lấy role từ payload
            user_role = user_payload.get("role")
            
            # Kiểm tra nếu không có role trong payload
            if user_role is None:
                return json({"error": "User role not found in token"}, status=403)

            # Kiểm tra role có trong danh sách cho phép không
            if user_role not in roles:
                return json({
                    "error": f"Forbidden: Required roles {roles}, but user has {user_role}"
                }, status=403)

            return await handler(request, *args, **kwargs)

        return wrapper
    return decorator