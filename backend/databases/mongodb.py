from backend.constants.mongodb_constants import MongoCollections
from pymongo import MongoClient
from config import Config


class MongoDB:
    def __init__(self, connection_url=None):
        if connection_url is None:
            connection_url = Config.MONGO_URI
        self.client = MongoClient(connection_url)
        self.db = self.client[Config.MONGO_DB_NAME]

        # Collection
        self.users_col = self.db[MongoCollections.users]
        self.products_col = self.db[MongoCollections.products]

    # Ví dụ method insert user
    def insert_user(self, user_data):
        return self.users_col.insert_one(user_data)

    # Ví dụ method insert product
    def insert_product(self, product_data):
        return self.products_col.insert_one(product_data)
