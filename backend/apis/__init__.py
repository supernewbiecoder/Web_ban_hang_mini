from sanic import Blueprint
from backend.apis.example_blueprint import example
from backend.apis.products_manager import products
from backend.apis.auth_manager import auth
api = Blueprint.group(products,example,auth)
