from sanic import Blueprint
from backend.apis.example_blueprint import example
from backend.apis.products_manager import products
from backend.apis.auth_manager import auth
from backend.apis.suppliers_manager import suppliers
from backend.apis.user_manager import user
from backend.apis.order_manager import orders
api = Blueprint.group(products,example,auth,suppliers,user,orders)
