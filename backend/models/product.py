from datetime import datetime
from typing import Dict, Optional


class Product:
    def __init__(
        self,
        code: str,
        name: str,
        category: str,
        unit: str,
        supplier_id: str,
        description: str = "",
        status: str = "active",
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.code = code
        self.name = name
        self.category = category
        self.unit = unit
        self.supplier_id = supplier_id
        self.description = description
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
            "unit": self.unit,
            "supplier_id": self.supplier_id,
            "description": self.description,
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
            unit=data.get("unit"),
            supplier_id=data.get("supplier_id"),
            description=data.get("description", ""),
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
        "unit": {"type": "string", "minLength": 1},
        "supplier_id": {"type": "string", "minLength": 1},
        "description": {"type": "string"},
        "status": {"type": "string", "enum": ["active", "inactive"]},
        "created_at": {"type": "string", "format": "date-time"},
        "updated_at": {"type": "string", "format": "date-time"},
    },
    "required": ["code", "name", "category", "unit", "supplier_id"],
}

update_product_schema = {
    "type": "object",
    "properties": {
        "code": {"type": "string", "minLength": 1},
        "name": {"type": "string", "minLength": 1},
        "category": {"type": "string", "minLength": 1},
        "unit": {"type": "string", "minLength": 1},
        "supplier_id": {"type": "string", "minLength": 1},
        "description": {"type": "string"},
        "status": {"type": "string", "enum": ["active", "inactive"]},
        "created_at": {"type": "string", "format": "date-time"},
        "updated_at": {"type": "string", "format": "date-time"},
    },
}