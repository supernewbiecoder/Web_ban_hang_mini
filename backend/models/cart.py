from datetime import datetime
from typing import Dict, List, Optional


class Cart:
    """Đại diện giỏ hàng của một user"""
    def __init__(self,
                 username: str,
                 items: List[Dict] = None,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self.username = username
        self.items = items or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        
    def get_total_price(self) -> float:
        """Tính tổng giá trị giỏ hàng"""
        return round(sum(item.get("price", 0) * item.get("quantity", 0) for item in self.items), 2)
    
    def get_total_items(self) -> int:
        """Tính tổng số lượng items trong giỏ"""
        return sum(item.get("quantity", 0) for item in self.items)
    
    def to_dict(self) -> Dict:
        """Convert Cart object to dictionary"""
        def _dt(value):
            return value.isoformat() if isinstance(value, datetime) else value
        
        return {
            "username": self.username,
            "items": self.items,
            "total_price": self.get_total_price(),
            "total_items": self.get_total_items(),
            "created_at": _dt(self.created_at),
            "updated_at": _dt(self.updated_at),
        }


# Schema để validate dữ liệu thêm item vào giỏ hàng
add_to_cart_schema = {
    "type": "object",
    "properties": {
        "product_id": {"type": "string"},
        "product_name": {"type": "string"},
        "price": {"type": "number", "minimum": 0},
        "quantity": {"type": "integer", "minimum": 1},
        "image_url": {"type": "string"}
    },
    "required": ["product_id", "product_name", "price", "quantity"],
    "additionalProperties": False
}

# Schema để validate dữ liệu cập nhật số lượng item
update_cart_item_schema = {
    "type": "object",
    "properties": {
        "quantity": {"type": "integer", "minimum": 0}
    },
    "required": ["quantity"],
    "additionalProperties": False
}
