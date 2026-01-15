from sanic import Blueprint
from backend.apis.example_blueprint import example
from backend.apis.products_manager import products
from backend.apis.auth_manager import auth
from backend.apis.suppliers_manager import suppliers
api = Blueprint.group(products,example,auth,suppliers)
