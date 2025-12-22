from backend.constants.mongodb_constants import MongoCollections
from pymongo import MongoClient
from config import Config

class MongoDB:
    def __init__(self, connection_url=None):
        if connection_url is None:
            connection_url = Config.MONGO_URI
        self.client = MongoClient(connection_url)
        self.db = self.client[Config.MONGO_DB_NAME]

    def get_collection(self, name):
        return self.db[name]
