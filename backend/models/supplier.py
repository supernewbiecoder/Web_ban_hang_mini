from datetime import datetime
from typing import List, Dict, Optional


class Supplier:
    def __init__(
        self,
        name: str,
        supplier_id: str,
        contact_method: str,
        products_imported: List[str],
        supply_start_date: datetime,
        supply_end_date: Optional[datetime] = None,
        batches_per_product: Dict[str, int] = None,
        batch_references: List[str] = None,
    ):
        """
        Tạo một supplier mới
        
        Args:
            name: Tên của supplier
            supplier_id: ID của supplier
            contact_method: Phương thức liên lạc (email, phone, etc.)
            products_imported: Danh sách các sản phẩm đã nhập
            supply_start_date: Ngày bắt đầu cung cấp
            supply_end_date: Ngày kết thúc cung cấp (optional)
            batches_per_product: Tổng số lô cho từng sản phẩm đã nhập
            batch_references: Tham chiếu tới từng lô
        """
        self.name = name
        self.supplier_id = supplier_id
        self.contact_method = contact_method
        self.products_imported = products_imported
        self.supply_start_date = supply_start_date
        self.supply_end_date = supply_end_date
        self.batches_per_product = batches_per_product or {}
        self.batch_references = batch_references or []

    def to_dict(self) -> Dict:
        """Chuyển đổi supplier thành dictionary"""
        return {
            "name": self.name,
            "supplier_id": self.supplier_id,
            "contact_method": self.contact_method,
            "products_imported": self.products_imported,
            "supply_start_date": self.supply_start_date,
            "supply_end_date": self.supply_end_date,
            "batches_per_product": self.batches_per_product,
            "batch_references": self.batch_references,
        }

    @staticmethod
    def from_dict(data: Dict) -> "Supplier":
        """Tạo Supplier từ dictionary"""
        return Supplier(
            name=data.get("name"),
            supplier_id=data.get("supplier_id"),
            contact_method=data.get("contact_method"),
            products_imported=data.get("products_imported", []),
            supply_start_date=data.get("supply_start_date"),
            supply_end_date=data.get("supply_end_date"),
            batches_per_product=data.get("batches_per_product", {}),
            batch_references=data.get("batch_references", []),
        )


# Schema validation cho supplier
create_supplier_schema = {
    'type': 'object',
    'properties': {
        'name': {'type': 'string', 'minLength': 1},
        'supplier_id': {'type': 'string', 'minLength': 1},
        'contact_method': {'type': 'string', 'minLength': 1},
        'products_imported': {
            'type': 'array',
            'items': {'type': 'string'},
            'default': []
        },
        'supply_start_date': {'type': 'string'},  # ISO format datetime
        'supply_end_date': {'type': ['string', 'null']},  # Optional
        'batches_per_product': {
            'type': 'object',
            'additionalProperties': {'type': 'integer', 'minimum': 0},
            'default': {}
        },
        'batch_references': {
            'type': 'array',
            'items': {'type': 'string'},
            'default': []
        }
    },
    'required': ['name', 'supplier_id', 'contact_method', 'supply_start_date']
}

update_supplier_schema = {
    'type': 'object',
    'properties': {
        'name': {'type': 'string', 'minLength': 1},
        'supplier_id': {'type': 'string', 'minLength': 1},
        'contact_method': {'type': 'string', 'minLength': 1},
        'products_imported': {
            'type': 'array',
            'items': {'type': 'string'}
        },
        'supply_start_date': {'type': 'string'},
        'supply_end_date': {'type': ['string', 'null']},
        'batches_per_product': {
            'type': 'object',
            'additionalProperties': {'type': 'integer', 'minimum': 0}
        },
        'batch_references': {
            'type': 'array',
            'items': {'type': 'string'}
        }
    }
}
