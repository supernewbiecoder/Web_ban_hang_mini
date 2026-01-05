from bson import ObjectId
from jsonschema import validate, ValidationError
from backend.constants.mongodb_constants import MongoCollections
from backend.databases.mongodb import MongoDB
from typing import Dict
from pymongo.errors import DuplicateKeyError
from backend.models.batch import create_batch_schema, update_batch_schema
class BatchRepository:
    def __init__(self, db: MongoDB):
        self.batch = db.get_collection(MongoCollections.batch)
        self._ensure_indexes()
    def _ensure_indexes(self):
        """Tao cac chi muc cho collection"""
        try:
            self.batch.create_index("batch_code",unique=True)
        except Exception:
            pass
    def _validate_data(self, data:Dict, schema:Dict)->None:
        """Validate du lieu theo JSON schema"""
        try:
            validate(instance=data, schema=schema)
        except ValidationError as e:
            raise ValidationError(f"Du lieu khong hop le: {e.message}")
    #-----------------------------------------------------------
    #CREATE BATCH
    #-----------------------------------------------------------
    def insert_batch(self,batch_data:Dict):
        #them mot bath moi
        #args:
        #   batch_data: du lieu batch
        #returns:
        #   id cua batch vua duoc tao
        self._validate_data(batch_data, create_batch_schema) #Bad request _400 bao giờ tạo API route thì chuyển sang đấy sau

        try:
            result=self.batch.insert_one(batch_data)
        except DuplicateKeyError:
            raise ValueError(f"Batch '{batch_data.get('batch_id')}' da ton tai")
        return result.inserted_id
    
    #-----------------------------------------------------------
    #GET BATCH
    #-----------------------------------------------------------
    def get_batch_by_code(self, batch_code: str) -> Dict:
        """Lay batch theo ma batch"""
        return self.batch.find_one({"batch_code": batch_code})
    
    def get_all_batches(self) -> Dict:
        """Lay tat ca batch"""
        return list(self.batch.find())
    def get_batches_by_Object_id(self, _id):
        """Lay batch theo _id"""
        return self.batch.find_one({"_id": ObjectId(_id)})
    #-----------------------------------------------------------
    #UPDATE BATCH
    #-----------------------------------------------------------
    def update_batch(self, batch_code: str, update_data: Dict) -> bool:
        """Cap nhat thong tin batch"""
        self._validate_data(update_data, update_batch_schema) #Bad request _400 bao giờ tạo API route thì chuyển sang đấy sau
        result = self.batch.update_one(
            {"batch_code": batch_code},
            {"$set": update_data}
        )
        return result.modified_count > 0
    #-----------------------------------------------------------
    #DELETE BATCH
    #-----------------------------------------------------------
    def delete_batch(self, batch_code: str) -> bool:
        """Xoa batch"""
        result = self.batch.delete_one({"batch_code": batch_code})
        return result.deleted_count > 0
    
    