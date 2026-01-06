from backend.databases.mongodb import MongoDB
from backend.decorators.auth import token_required,require_role
from sanic import Blueprint, text

_db = MongoDB()
products = Blueprint('products_manager', url_prefix='/products')


@products.route('/')
@token_required
@require_role("admin")
async def bp_root(request):
    return text("product")


