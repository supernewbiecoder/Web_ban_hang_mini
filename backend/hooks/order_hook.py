# Helper function
from backend.constants.order_filter import Order_filter


def _serialize_order(order):
    """Serialize order ObjectId to string."""
    if order and "_id" in order:
        order["_id"] = str(order["_id"])
    return order


def get_order_filter_request(request):
    """Lấy filter từ request query parameters."""
    order_id = request.args.get("order_id")
    customer_id = request.args.get("customer_id")
    shipping_address = request.args.get("shipping_address")
    payment_method = request.args.get("payment_method")
    payment_status = request.args.get("payment_status")
    order_status = request.args.get("order_status")
    note = request.args.get("note")
    
    # Xử lý start/num an toàn
    try:
        start = int(request.args.get("start"))
    except (TypeError, ValueError):
        start = -1
    
    try:
        num = int(request.args.get("num"))
    except (TypeError, ValueError):
        num = -1
    
    filter_obj = Order_filter(
        order_id=order_id,
        customer_id=customer_id,
        shipping_address=shipping_address,
        payment_method=payment_method,
        payment_status=payment_status,
        order_status=order_status,
        note=note,
        start=start,
        num=num
    )
    return filter_obj

