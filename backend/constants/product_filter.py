from typing import Dict


class Product_filter:
    def __init__(
        self,
        category: str = None,
        status: str = None,
        supplier_id: str = None,
        product_code: str = None,
        supplier_name: str = None,
        product_name: str = None,
        start: int = None, end: int = None,
        
    ):
        self.category = category
        self.status = status
        self.supplier_id = supplier_id
        self.product_code = product_code
        self.supplier_name = supplier_name
        self.product_name = product_name
        if start == -1: start = None
        if end == -1: end = None
        self.start = start
        self.end = end
    def to_dict(self) -> Dict:
        return {
            "category": self.category,
            "status": self.status,
            "supplier_id": self.supplier_id,
            "code": self.product_code,  # Map to 'code' field in DB
            "supplier_name": self.supplier_name,
            "name": self.product_name,  # Map to 'name' field in DB
            "start": self.start,
            "end": self.end,
        }

