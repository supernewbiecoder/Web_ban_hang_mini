from sanic import Blueprint, json
from backend.constants.enum import User_Role
from backend.databases.mongodb import MongoDB
from backend.databases.user_collection import UserRepository
from backend.decorators.auth import token_required,require_role
from backend.hooks.user_hook import get_filter_request
from backend.views.admin_view import user_list_view


user = Blueprint('users', url_prefix='/users')
_db = MongoDB()
user_repo = UserRepository(_db)
# ===================================================================
# GET ALL Users by filter
# ===================================================================

@user.route('/')
@token_required
@require_role([User_Role.ADMIN])
async def bp_get_users(request):
    filter_object = get_filter_request(request)
    users_data = user_repo.get_user_by_filter(filter_object.to_dict())
    result = user_list_view(users_data)
    return json(result, status=200)

