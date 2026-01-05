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
            self.supplier.create_index("supplier_id", unique=True)
            self.supplier.create_index("name")
        except Exception:
            pass

    def _validate_data(self, data: Dict, schema: Dict) -> None:
        """
        Kiểm tra tính hợp lệ của dữ liệu theo schema
        
        Args:
            data: Dữ liệu cần kiểm tra
            schema: Schema để validate
            
        Raises:
            ValidationError: Nếu dữ liệu không hợp lệ
        """
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
        self._validate_data(supplier_data, create_supplier_schema)
        
        try:
            result = self.supplier.insert_one(supplier_data)
            return result.inserted_id
        except DuplicateKeyError:
            raise ValueError(f"Supplier '{supplier_data.get('supplier_id')}' đã tồn tại")

    def get_supplier_by_name(self, name: str) -> Optional[Dict]:
        """Lấy supplier theo tên"""
        return self.supplier.find_one({"name": name})

    def get_supplier_by_id(self, supplier_id: str) -> Optional[Dict]:
        """Lấy supplier theo ID"""
        return self.supplier.find_one({"supplier_id": supplier_id})

    def get_supplier_by_object_id(self, object_id) -> Optional[Dict]:
        """Lấy supplier theo MongoDB ObjectId"""
        return self.supplier.find_one({"_id": ObjectId(object_id)})

    def get_all_suppliers(self) -> List[Dict]:
        """Lấy tất cả suppliers"""
        return list(self.supplier.find())

    def update_supplier(self, supplier_id: str, update_data: Dict) -> bool:
        """
        Cập nhật thông tin supplier
        
        Args:
            supplier_id: ID của supplier
            update_data: Dữ liệu cần cập nhật
            
        Returns:
            True nếu cập nhật thành công
            
        Raises:
            ValidationError: Nếu dữ liệu không hợp lệ
        """
        self._validate_data(update_data, update_supplier_schema)
        
        result = self.supplier.update_one(
            {"supplier_id": supplier_id},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def delete_supplier(self, supplier_id: str) -> bool:
        """Xóa supplier"""
        result = self.supplier.delete_one({"supplier_id": supplier_id})
        return result.deleted_count > 0

    def add_product_to_supplier(
        self,
        supplier_id: str,
        product_id: str,
        batch_count: int = 0
    ) -> bool:
        """
        Thêm sản phẩm vào danh sách sản phẩm của supplier
        
        Args:
            supplier_id: ID của supplier
            product_id: ID của sản phẩm
            batch_count: Số lô ban đầu
            
        Returns:
            True nếu thêm thành công
        """
        if not isinstance(product_id, str) or not product_id:
            raise ValueError("product_id phải là string không rỗng")
        if not isinstance(batch_count, int) or batch_count < 0:
            raise ValueError("batch_count phải là số nguyên >= 0")
        
        result = self.supplier.update_one(
            {"supplier_id": supplier_id},
            {
                "$addToSet": {"products_imported": product_id},
                "$set": {f"batches_per_product.{product_id}": batch_count}
            }
        )
        return result.modified_count > 0

    def update_batch_count(
        self,
        supplier_id: str,
        product_id: str,
        batch_count: int
    ) -> bool:
        """Cập nhật số lô cho một sản phẩm cụ thể"""
        if not isinstance(product_id, str) or not product_id:
            raise ValueError("product_id phải là string không rỗng")
        if not isinstance(batch_count, int) or batch_count < 0:
            raise ValueError("batch_count phải là số nguyên >= 0")
        
        result = self.supplier.update_one(
            {"supplier_id": supplier_id},
            {"$set": {f"batches_per_product.{product_id}": batch_count}}
        )
        return result.modified_count > 0

    def add_batch_reference(self, supplier_id: str, batch_id: str) -> bool:
        """
        Thêm tham chiếu tới một lô
        
        Args:
            supplier_id: ID của supplier
            batch_id: ID của lô
            
        Returns:
            True nếu thêm thành công
        """
        if not isinstance(batch_id, str) or not batch_id:
            raise ValueError("batch_id phải là string không rỗng")
        
        result = self.supplier.update_one(
            {"supplier_id": supplier_id},
            {"$addToSet": {"batch_references": batch_id}}
        )
        return result.modified_count > 0

    def remove_batch_reference(self, supplier_id: str, batch_id: str) -> bool:
        """Xóa tham chiếu tới một lô"""
        if not isinstance(batch_id, str) or not batch_id:
            raise ValueError("batch_id phải là string không rỗng")
        
        result = self.supplier.update_one(
            {"supplier_id": supplier_id},
            {"$pull": {"batch_references": batch_id}}
        )
        return result.modified_count > 0

    def get_suppliers_by_product(self, product_id: str) -> List[Dict]:
        """Lấy danh sách các suppliers có sản phẩm cụ thể"""
        return list(self.supplier.find({"products_imported": product_id}))

    def get_suppliers_by_batch(self, batch_id: str) -> List[Dict]:
        """Lấy danh sách các suppliers có tham chiếu tới lô cụ thể"""
        return list(self.supplier.find({"batch_references": batch_id}))

    def end_supply(self, supplier_id: str, end_date: datetime = None) -> bool:
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
            {"supplier_id": supplier_id},
            {"$set": {"supply_end_date": end_date}}
        )
        return result.modified_count > 0
