from backend.constants.mongodb_constants import MongoCollections
from backend.databases.mongodb import MongoDB
from pymongo.errors import DuplicateKeyError
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from bson import ObjectId
from backend.models.supplier import create_supplier_schema, update_supplier_schema
from backend.utils.validation import validate_data
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
        validate_data(supplier_data, create_supplier_schema) #Bad request _400 bao giờ tạo API route thì chuyen sang đấy sau

        now_iso = datetime.now().isoformat()
        supplier_data.setdefault("created_at", now_iso)
        supplier_data.setdefault("updated_at", now_iso)

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

    def get_suppliers_by_filter(self,filter)->List[Dict]:
        query: Dict = {
            k: v 
            for k, v in (filter or {}).items()
            if v not in (None, "") and k not in ("start", "num")
        }
        cursor = self.supplier.find(query)
        start = filter.get("start")
        num = filter.get("num")
        # lấy num sản phẩm tính từ start
        if start is not None and num is not None:
            start = max(start, 0)
            num = max(num, 1)
            cursor = cursor.skip(start).limit(num)
        return list(cursor)


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
        validate_data(update_data, update_supplier_schema) #Bad request _400 bao giờ tạo API route thì chuyển sang đấy sau

        update_data["updated_at"] = datetime.now().isoformat()

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
            {"$set": {
            "supply_end_date": end_date,
            "status": "inactive"
        }}
        )
        return result.modified_count > 0

    def is_supplier_exist(self, supplier_code: str) -> Tuple[bool, Dict, int]:
        """Kiểm tra sự tồn tại của supplier theo code.

        Returns:
            Tuple[bool, Dict, int]:
                - is_valid: True nếu tìm thấy, False nếu lỗi.
                - payload: supplier document khi thành công, hoặc dict lỗi khi thất bại.
                - status: mã HTTP gợi ý.
        """
        if not supplier_code:
            return False, {"error": "supplier_id là bắt buộc"}, 400

        supplier = self.get_supplier_by_code(supplier_code)
        if not supplier:
            return False, {"error": "id nhà cung cấp không tồn tại, hãy tạo nhà cung cấp trước"}, 400

        return True, supplier, 200