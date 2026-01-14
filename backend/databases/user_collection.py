from passlib.hash import bcrypt
from backend.databases.mongodb import MongoDB
from backend.constants.mongodb_constants import MongoCollections
from pymongo.errors import DuplicateKeyError
from backend.utils.validation import validate_data
from backend.models.user import create_user_schema
class UserRepository:
    def __init__(self, db: MongoDB):
        self.user = db.get_collection(MongoCollections.user)
        self._ensure_indexes()
    def _ensure_indexes(self):
        try:
            self.user.create_index("username", unique=True)
        except Exception:
            pass

    def insert_user(self, user_data):
        validate_data(user_data, create_user_schema)
        try:
            return self.user.insert_one(user_data)
        except DuplicateKeyError:
            raise ValueError("Username already exists")

    def get_user_by_username(self, username: str):
        return self.user.find_one({"username": username})
