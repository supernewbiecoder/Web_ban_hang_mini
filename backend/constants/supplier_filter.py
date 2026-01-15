from typing import Dict
from backend.constants.enum import Supplier_Status
class Supplier_filter:
    def __init__(
            self,
            code: str = None,
            name: str = None,
            address: str = None,
            phone: str = None,
            email: str = None,
            status: str = Supplier_Status.ACTIVE,
            start: int = None, num: int = None,
    ):
        self.code = code
        self.name = name
        self.address = address
        self.phone = phone
        self.email = email
        self.status = status
        if start == -1: start = None
        if num == -1: num = None
        self.start = start
        self.num = num
    
    def to_dict(self) -> Dict:
        return{
            "code": self.code,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "status": self.status,
            "start": self.start,
            "num": self.num,
        }
    