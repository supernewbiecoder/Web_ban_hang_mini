from backend.databases.mongodb import MongoDB
from backend.constants.mongodb_constants import MongoCollections
from pymongo.errors import DuplicateKeyError

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
        try:
            return self.user.insert_one(user_data)
        except DuplicateKeyError:
            raise ValueError("Username already exists")

    def get_user_by_username(self, username: str):
        return self.user.find_one({"username": username})
