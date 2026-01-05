from datetime import datetime
from typing import Dict, Optional


class Batch:
    def __init__(
        self,
        batch_code: str,
        product_id: str,
        manufacture_date: datetime,
        expiry_date: datetime,
        import_date: datetime,
        import_price: float,
        quantity: int,
        status: str = "available",
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.batch_code = batch_code
        self.product_id = product_id
        self.manufacture_date = manufacture_date
        self.expiry_date = expiry_date
        self.import_date = import_date
        self.import_price = import_price
        self.quantity = quantity
        self.status = status

    def to_dict(self) -> Dict:
        return {
            "_id": self._id,
            "batch_code": self.batch_code,
            "product_id": self.product_id,
            "manufacture_date": self.manufacture_date,
            "expiry_date": self.expiry_date,
            "import_date": self.import_date,
            "import_price": self.import_price,
            "quantity": self.quantity,
            "status": self.status,
        }

    @staticmethod
    def from_dict(data: Dict) -> "Batch":
        return Batch(
            _id=data.get("_id"),
            batch_code=data.get("batch_code"),
            product_id=data.get("product_id"),
            manufacture_date=data.get("manufacture_date"),
            expiry_date=data.get("expiry_date"),
            import_date=data.get("import_date"),
            import_price=data.get("import_price"),
            quantity=data.get("quantity"),
            status=data.get("status", "available"),
        )


create_batch_schema = {
    "type": "object",
    "properties": {
        "batch_code": {"type": "string", "minLength": 1},
        "product_id": {"type": "string", "minLength": 1},
        "manufacture_date": {"type": "string", "format": "date-time"},
        "expiry_date": {"type": "string", "format": "date-time"},
        "import_date": {"type": "string", "format": "date-time"},
        "import_price": {"type": "number", "minimum": 0},
        "quantity": {"type": "integer", "minimum": 0},
        "status": {"type": "string", "enum": ["available", "unavailable"]},
    },
    "required": [
        "batch_code",
        "product_id",
        "manufacture_date",
        "expiry_date",
        "import_date",
        "import_price",
        "quantity",
    ],
}

update_batch_schema = {
    "type": "object",
    "properties": {
        "batch_code": {"type": "string", "minLength": 1},
        "product_id": {"type": "string", "minLength": 1},
        "manufacture_date": {"type": "string", "format": "date-time"},
        "expiry_date": {"type": "string", "format": "date-time"},
        "import_date": {"type": "string", "format": "date-time"},
        "import_price": {"type": "number", "minimum": 0},
        "quantity": {"type": "integer", "minimum": 0},
        "status": {"type": "string", "enum": ["available", "unavailable"]},
    },
}