from datetime import datetime
from typing import Dict, Optional


class Supplier:
    def __init__(
        self,
        code: str,
        name: str,
        phone: str,
        email: str,
        address: str,
        status: str = "active",
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.code = code
        self.name = name
        self.phone = phone
        self.email = email
        self.address = address
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self) -> Dict:
        return {
            "_id": self._id,
            "code": self.code,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "address": self.address,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @staticmethod
    def from_dict(data: Dict) -> "Supplier":
        return Supplier(
            _id=data.get("_id"),
            code=data.get("code"),
            name=data.get("name"),
            phone=data.get("phone"),
            email=data.get("email"),
            address=data.get("address"),
            status=data.get("status", "active"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )


create_supplier_schema = {
    "type": "object",
    "properties": {
        "code": {"type": "string", "minLength": 1},
        "name": {"type": "string", "minLength": 1},
        "phone": {"type": "string", "minLength": 1},
        "email": {"type": "string", "format": "email"},
        "address": {"type": "string", "minLength": 1},
        "status": {"type": "string", "enum": ["active", "inactive"]},
        "created_at": {"type": "string", "format": "date-time"},
        "updated_at": {"type": "string", "format": "date-time"},
    },
    "required": ["code", "name", "phone", "email", "address"],
}

update_supplier_schema = {
    "type": "object",
    "properties": {
        "code": {"type": "string", "minLength": 1},
        "name": {"type": "string", "minLength": 1},
        "phone": {"type": "string", "minLength": 1},
        "email": {"type": "string", "format": "email"},
        "address": {"type": "string", "minLength": 1},
        "status": {"type": "string", "enum": ["active", "inactive"]},
        "created_at": {"type": "string", "format": "date-time"},
        "updated_at": {"type": "string", "format": "date-time"},
    },
}
