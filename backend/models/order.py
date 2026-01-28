from datetime import datetime
from typing import Dict, List, Optional
from backend.constants.enum import Payment_Status, Order_Status

class Order:
    def __init__(self,
                 order_id: str,  # Fixed typo: "oder_id" to "order_id"
                 customer_id: str,
                 items: List[Dict],
                 shipping_address: str,
                 payment_method: str,
                 payment_status: str = Payment_Status.PENDING,
                 order_status: str = Order_Status.PROCESSING,
                 note: str = "",
                 price: float = 0.0,
                 created_at: Optional[datetime] = None):
        self.order_id = order_id  # Fixed to match parameter name
        self.customer_id = customer_id
        self.items = items
        self.shipping_address = shipping_address
        self.payment_method = payment_method
        self.payment_status = payment_status
        self.order_status = order_status
        self.note = note
        self.price = price
        self.created_at = created_at or datetime.utcnow()
        
    def to_dict(self) -> Dict:
        """Convert Order object to dictionary for JSON serialization."""
        def _dt(value):
            return value.isoformat() if isinstance(value, datetime) else value

        return {
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "items": self.items,
            "shipping_address": self.shipping_address,
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "order_status": self.order_status,
            "note": self.note,
            "price": self.price,
            "created_at": _dt(self.created_at),
        }


create_order_schema = {
    "type": "object",
    "properties": {
        "order_id": {"type": "string"},
        "user_id": {"type": "string"},
        "items": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string"},
                    "name": {"type": "string"},
                    "price": {"type": "number", "minimum": 0},
                    "quantity": {"type": "integer", "minimum": 1},
                },
                "required": ["product_id", "name", "price", "quantity"]
            }
        },
        "total_amount": {"type": "number", "minimum": 0},
        "price": {"type": "number", "minimum": 0},
        "shipping_address": {
            "type": "object",
            "properties": {
                "receiver_name": {"type": "string"},
                "phone": {"type": "string"},
                "full_address": {"type": "string"}
            },
            "required": ["receiver_name", "phone", "full_address"]
        },
        "payment_method": {"type": "string", "enum": ["cod", "momo", "vnpay", "banking"]},
        "note": {"type": "string"}
    },
    "required": ["user_id", "items", "total_amount", "shipping_address", "payment_method"],
    "additionalProperties": False,

}

# Optional: Add update order schema if needed
update_order_schema = {
    "type": "object",
    "properties": {
        "order_status": {"type": "string"},
        "payment_status": {"type": "string"},
        "note": {"type": "string"}
    },
    "additionalProperties": False
}