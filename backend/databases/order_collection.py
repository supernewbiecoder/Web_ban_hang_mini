from datetime import datetime
from typing import Dict
from backend.constants.mongodb_constants import MongoCollections
from backend.databases.mongodb import MongoDB
from backend.utils.validation import validate_data
from backend.models.order import create_order_schema

class OrderRepository:
    def __init__(self, db:MongoDB):
        self.order = db.get_collection(MongoCollections.order)
        self._ensure_indexes()
    def _ensure_indexes(self) -> None:
        """Create product indexes."""
        try:
            self.order.create_index("order_id", unique=True)
        except Exception:
            pass
    
    def insert_order(self, order_data: Dict):
        validate_data(order_data,create_order_schema)
        now_iso = datetime.now().isoformat()
        order_data.setdefault("created_at", now_iso)
        try:
            result = self.order.insert_one(order_data)
            return result.inserted_id
        except Exception:
            pass
    def get_order_by_id(self, order_id: str) -> Dict:
        """Fetch one order by order_id."""
        return self.order.find_one({"order_id": order_id})
    def get_orders_by_filter(self, filter: Dict) -> Dict:
        query : Dict = {
            k: v
            for k, v in (filter or {}).items()
            if v not in (None, "") and k not in ("start", "num")
        }
        # Map API filter field 'customer_id' to stored field 'user_id' if present
        if "customer_id" in query:
            query["user_id"] = query.pop("customer_id")
        cursor = self.order.find(query)
        start = filter.get("start")
        num = filter.get("num")
        # lấy num sản phẩm tính từ start
        if start is not None and num is not None:
            start = max(start, 1)
            num = max(num, 1)
            cursor = cursor.skip(start-1).limit(num)
        return list(cursor)
    def delete_order_by_id(self, order_id: str) -> bool:
        """Delete one order by order_id."""
        result = self.order.delete_one({"order_id": order_id})
        return result.deleted_count > 0
    
    def update_order(self, order_id: str, update_data: Dict) -> bool:
        """Update order by order_id."""
        if not update_data:
            return False
        try:
            result = self.order.update_one(
                {"order_id": order_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception:
            return False
