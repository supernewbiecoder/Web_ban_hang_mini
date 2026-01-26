from datetime import datetime
from typing import Dict, Optional
from backend.constants import enum

class Product:
    def __init__(
        self,
        code: str,
        name: str,
        category: str,
        supplier_id: str,
        sell_price: float,
        import_price: float,
        description: str = "",
        total_quantity: int = 0,
        status: str = "active",
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.code = code
        self.name = name
        self.category = category
        self.supplier_id = supplier_id
        self.sell_price = sell_price
        self.import_price = import_price
        self.description = description
        self.total_quantity = total_quantity
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self) -> Dict:
        def _dt(value):
            return value.isoformat() if isinstance(value, datetime) else value

        return {
            "_id": self._id,
            "code": self.code,
            "name": self.name,
            "category": self.category,
            "supplier_id": self.supplier_id,
            "sell_price": self.sell_price,
            "import_price": self.import_price,
            "description": self.description,
            "total_quantity": self.total_quantity,
            "status": self.status,
            "created_at": _dt(self.created_at),
            "updated_at": _dt(self.updated_at),
        }

    @staticmethod
    def from_dict(data: Dict) -> "Product":
        return Product(
            _id=data.get("_id"),
            code=data.get("code"),
            name=data.get("name"),
            category=data.get("category"),
            supplier_id=data.get("supplier_id"),
            sell_price=data.get("sell_price", 0),
            import_price=data.get("import_price", 0),
            description=data.get("description", ""),
            total_quantity=data.get("total_quantity", 0),
            status=data.get("status", "active"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


create_product_schema = {
    "type": "object",
    "properties": {
        "code": {"type": "string", "minLength": 1},
        "name": {"type": "string", "minLength": 1},
        "category": {"type": "string", "minLength": 1},
        "supplier_id": {"type": "string", "minLength": 1},
        "sell_price": {"type": "number", "minimum": 0},
        "import_price": {"type": "number", "minimum": 0},
        "description": {"type": "string"},
        "total_quantity": {"type": "integer", "minimum": 0},
        "status": {
            "type": "string",
            "enum": [
                enum.Product_Status.ACTIVE,
                enum.Product_Status.INACTIVE
            ]
        }
    },
    "required": [
        "code",
        "name",
        "category",
        "supplier_id",
        "sell_price",
        "import_price"
    ],
    "additionalProperties": False
}

update_product_schema = {
    "type": "object",
    "properties": {
        "code": {"type": "string", "minLength": 1},
        "name": {"type": "string", "minLength": 1},
        "category": {"type": "string", "minLength": 1},
        "supplier_id": {"type": "string", "minLength": 1},
        "sell_price": {"type": "number", "minimum": 0},
        "import_price": {"type": "number", "minimum": 0},
        "description": {"type": "string"},
        "total_quantity": {"type": "integer", "minimum": 0},
        "status": {"type": "string", "enum": [enum.Product_Status.ACTIVE, enum.Product_Status.INACTIVE]},
    },
    "additionalProperties": False
}
filter_product_schema = {
    "type": "object",
    "properties": {
        "category": {"type": "string"},
        "status": {"type": "string", "enum": [enum.Product_Status.ACTIVE, enum.Product_Status.INACTIVE]},
        "supplier_id": {"type": "string"},
        "product_code": {"type": "string"},
        "supplier_name": {"type": "string"},
        "product_name": {"type": "string"},
        "start": {"type": "integer", "minimum": 0},
        "num": {"type": "integer", "minimum": 1},
    },
    "additionalProperties": False
}