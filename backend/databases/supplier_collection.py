from backend.constants.mongodb_constants import MongoCollections
from backend.databases.mongodb import MongoDB
from pymongo.errors import DuplicateKeyError
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId
from jsonschema import validate, ValidationError
from backend.models.supplier import create_supplier_schema, update_supplier_schema


class SupplierRepository:
    def __init__(self, db: MongoDB):
        self.supplier = db.get_collection(MongoCollections.supplier)
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Tạo các chỉ mục cho collection"""
        try:
            self.supplier.create_index("code", unique=True)
            self.supplier.create_index("name")
        except Exception:
            pass

    def _validate_data(self, data: Dict, schema: Dict) -> None:
        """Validate dữ liệu theo JSON schema"""
        try:
            validate(instance=data, schema=schema)
        except ValidationError as e:
            raise ValidationError(f"Dữ liệu không hợp lệ: {e.message}")


    def insert_supplier(self, supplier_data: Dict):
        """
        Thêm một supplier mới
        
        Args:
            supplier_data: Dữ liệu supplier
            
        Returns:
            ID của supplier vừa được tạo
            
        Raises:
            ValidationError: Nếu dữ liệu không hợp lệ
            ValueError: Nếu supplier đã tồn tại
        """
        self._validate_data(supplier_data, create_supplier_schema) #Bad request _400 bao giờ tạo API route thì chuyen sang đấy sau
        
        try:
            result = self.supplier.insert_one(supplier_data)
            return result.inserted_id
        except DuplicateKeyError:
            raise ValueError(f"Supplier '{supplier_data.get('code')}' đã tồn tại")

    def get_supplier_by_name(self, name: str) -> Optional[Dict]:
        """Lấy supplier theo tên"""
        return self.supplier.find_one({"name": name})

    def get_supplier_by_code(self, code: str) -> Optional[Dict]:
        """Lấy supplier theo code"""
        return self.supplier.find_one({"code": code})

    def get_supplier_by_object_id(self, object_id) -> Optional[Dict]:
        """Lấy supplier theo MongoDB ObjectId"""
        return self.supplier.find_one({"_id": ObjectId(object_id)})

    def get_all_suppliers(self) -> List[Dict]:
        """Lấy tất cả suppliers"""
        return list(self.supplier.find())

    def update_supplier(self, code: str, update_data: Dict) -> bool:
        """
        Cập nhật thông tin supplier
        
        Args:
            code: Mã của supplier
            update_data: Dữ liệu cần cập nhật
            
        Returns:
            True nếu cập nhật thành công
            
        Raises:
            ValidationError: Nếu dữ liệu không hợp lệ
        """
        self._validate_data(update_data, update_supplier_schema) #Bad request _400 bao giờ tạo API route thì chuyển sang đấy sau
        
        result = self.supplier.update_one(
            {"code": code},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def delete_supplier(self, code: str) -> bool:
        """Xóa supplier"""
        supplier = self.get_supplier_by_code(code)
        if not supplier:
            raise ValueError(f"Supplier với mã '{code}' không tồn tại")
        elif supplier.get("status") == "active":
            raise ValueError(f"Không thể xóa supplier đang hoạt động")
        result = self.supplier.delete_one({"code": code})
        return result.deleted_count > 0


    def end_supply(self, code: str, end_date: datetime = None) -> bool:
        """
        Kết thúc cung cấp với supplier
        
        Args:
            supplier_id: ID của supplier
            end_date: Ngày kết thúc (mặc định là hôm nay)
            
        Returns:
            True nếu cập nhật thành công
        """
        if end_date is None:
            end_date = datetime.now()
        
        result = self.supplier.update_one(
            {"code": code},
            {"$set": {"supply_end_date": end_date}},
            {"$set": {"status": "inactive"}}
        )
        return result.modified_count > 0
