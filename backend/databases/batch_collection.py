from backend.constants.mongodb_constants import MongoCollections
from backend.databases.mongodb import MongoDB
from typing import Dict
from pymongo.errors import DuplicateKeyError

class BatchReposistory:
    def __init__(self, db: MongoDB):
        self.batch = db.get_collection(MongoCollections.batch)
        self._ensure_indexes()
    def _ensure_indexes(self):
        """Tao cac chi muc cho collection"""
        try:
            self.batch.create.index("batch_id",unique=True)
        except Exception:
            pass
    def insert_batch(self,batch_data:Dict):
        #them mot bath moi
        #args:
        #   batch_data: du lieu batch
        #returns:
        #   id cua batch vua duoc tao
        try:
            result=self.batch.insert_one(batch_data)
        except DuplicateKeyError:
            raise ValueError(f"Batch '{batch_data.get('batch_id')}' da ton tai")
        return result.inserted_id