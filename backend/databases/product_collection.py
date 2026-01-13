from datetime import datetime
from typing import Dict, List, Optional

from bson import ObjectId
from jsonschema import validate, ValidationError
from pymongo.errors import DuplicateKeyError

from backend.constants.mongodb_constants import MongoCollections
from backend.databases.mongodb import MongoDB
from backend.models.product import create_product_schema, update_product_schema


class ProductRepository:
    def __init__(self, db: MongoDB):
        self.product = db.get_collection(MongoCollections.product)
        self._ensure_indexes()

    def _ensure_indexes(self) -> None:
        """Create product indexes."""
        try:
            self.product.create_index("code", unique=True)
            self.product.create_index("name")
            self.product.create_index("category")
        except Exception:
            pass

    def _validate_data(self, data: Dict, schema: Dict) -> None:
        """Validate payload with schema."""
        try:
            validate(instance=data, schema=schema)
        except ValidationError as e:
            raise ValidationError(f"Du lieu khong hop le: {e.message}")

    def insert_product(self, product_data: Dict):
        """Insert a new product document."""
        self._validate_data(product_data, create_product_schema)

        now_iso = datetime.now().isoformat()
        product_data.setdefault("created_at", now_iso)
        product_data.setdefault("updated_at", now_iso)

        try:
            result = self.product.insert_one(product_data)
            return result.inserted_id
        except DuplicateKeyError:
            raise ValueError(f"Product '{product_data.get('code')}' da ton tai")

    def get_product_by_code(self, code: str) -> Optional[Dict]:
        """Fetch one product by code."""
        return self.product.find_one({"code": code})

    def get_product_by_object_id(self, object_id) -> Optional[Dict]:
        """Fetch one product by ObjectId."""
        return self.product.find_one({"_id": ObjectId(object_id)})

    def get_all_products(self) -> List[Dict]:
        """Fetch all products."""
        return list(self.product.find())

    def get_products_by_supplier(self, supplier_id: str) -> List[Dict]:
        """Fetch all products belonging to a supplier."""
        return list(self.product.find({"supplier_id": supplier_id}))
    def get_products_by_filter(self, filter: Dict) -> List[Dict]:
        """Find products by a flexible filter with optional pagination.

        Args:
            filter: dict các điều kiện tìm kiếm (VD: {"code": "PRD001", "status": "active"}).

        Returns:
            Danh sách sản phẩm match filter.
        """

        # Xây dựng điều kiện lọc từ dict; bỏ qua key None/"" và bỏ cả các trường start/end
        query: Dict = {
            k: v
            for k, v in (filter or {}).items()
            if v not in (None, "") and k not in ("start", "end", "supplier_name")
        }

        cursor = self.product.find(query)
        start = filter.get("start")
        end = filter.get("end")
        # Nếu page/limit đều -1 thì không áp dụng skip/limit (trả toàn bộ)
        if start is not None and end is not None:
            start = max(start, 1)
            end = max(end, 1)
            cursor = cursor.skip(start).limit(end)
        return list(cursor)
    
    def update_product(self, code: str, update_data: Dict) -> bool:
        """Update product fields."""
        self._validate_data(update_data, update_product_schema)
        update_data["updated_at"] = datetime.now().isoformat()

        result = self.product.update_one({"code": code}, {"$set": update_data})
        return result.modified_count > 0

    def delete_product(self, code: str) -> bool:
        """Delete a product if it is inactive."""
        product = self.get_product_by_code(code)
        if not product:
            raise ValueError(f"Product '{code}' khong ton tai")
        if product.get("status") == "active":
            raise ValueError("Khong the xoa product dang active")

        result = self.product.delete_one({"code": code})
        return result.deleted_count > 0
