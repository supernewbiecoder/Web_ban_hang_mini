from sanic import Blueprint
from backend.apis.example_blueprint import example

api = Blueprint.group(example)
