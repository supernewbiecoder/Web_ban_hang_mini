from typing import Dict, List

from backend.models import supplier
from backend.models.product import Product, create_product_schema


class Batch:
    def __init__(self, batch_id: str, supplier_id: str, product: Product, quantity: int, manufacture_date: str, expiry_date: str):
        self.batch_id = batch_id
        self.supplier = supplier
        self.product = product
        self.quantity=quantity
        self.manufacture_date = manufacture_date
        self.expiry_date = expiry_date
    def to_dict(self) -> Dict:
        return {
            "batch_id": self.batch_id,
            "supplier": self.supplier,
            "product": self.product.to_dict(),
            "quantity": self.quantity,
            "manufacture_date": self.manufacture_date,
            "expiry_date": self.expiry_date,
        }
    @staticmethod
    def from_dict(data: Dict) -> "Batch":
        return Batch(
            batch_id=data.get("batch_id"),
            supplier=data.get("supplier"),
            product=Product.from_dict(data.get("product")),
            quantity=data.get("quantity"),
            manufacture_date=data.get("manufacture_date"),
            expiry_date=data.get("expiry_date"),
        )
# Schema validation cho batch
create_batch_schema = {
    "type": "object",
    "properties":{
        "batch_id": {"type": "string", "minLength": 1},
        "supplier": {"type": "string", "minLength": 1},
        "product": create_product_schema,
        "quantity": {"type": "integer", "minimum": 0},
        "manufacture_date": {"type": "string", "format": "date"},
        "expiry_date": {"type": "string", "format": "date"},
    },
    "required": ["batch_id", "product", "quantity", "manufacture_date", "expiry_date"]
}

update_batch_schema = {
    "type": "object",
    "properties":{
        "batch_id": {"type": "string", "minLength": 1},
        "supplier": {"type": "string", "minLength": 1},
        "product": create_product_schema,
        "quantity": {"type": "integer", "minimum": 0},
        "manufacture_date": {"type": "string", "format": "date"},
        "expiry_date": {"type": "string", "format": "date"},
    }
}