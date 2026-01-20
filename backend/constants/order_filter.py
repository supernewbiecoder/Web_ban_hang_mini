from datetime import datetime
from typing import Optional
from backend.constants.enum import Order_Status, Payment_Status


class Order_filter:
    def __init__(
        self,
        order_id: str = None,
        customer_id: str = None,
        shipping_address: str = None,
        item: list[dict] = None,
        payment_method: str = None,
        payment_status: str = Payment_Status.PENDING,
        order_status: str = Order_Status.PROCESSING,
        note: str = "",
        created_at: Optional[datetime] = None,
        start: int = None,
        num: int = None,
    ):
        self.order_id = order_id
        self.customer_id = customer_id
        self.shipping_address = shipping_address
        self.item = item
        self.payment_method = payment_method
        self.payment_status = payment_status
        self.order_status = order_status
        self.note = note
        self.created_at = created_at
        if start == -1: start = None
        if num == -1: num = None
        self.start = start
        self.num = num
    def to_dict(self) -> dict:
        return {
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "shipping_address": self.shipping_address,
            "item": self.item,
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "order_status": self.order_status,
            "note": self.note,
            "created_at": self.created_at,
            "start": self.start,
            "num": self.num,
        }