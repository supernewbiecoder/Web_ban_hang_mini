from sanic import Blueprint, json
from backend.databases.mongodb import MongoDB
from backend.databases.order_collection import OrderRepository
from backend.databases.product_collection import ProductRepository
from backend.decorators import token_required, require_role
from backend.constants import enum
from backend.constants.order_filter import Order_filter
from backend.hooks.order_hook import _serialize_order, get_order_filter_request
from backend.utils.validation import validate_data
from backend.models.order import create_order_schema
from jsonschema import ValidationError
from datetime import datetime
import uuid


_db = MongoDB()
order_repo = OrderRepository(_db)
product_repo = ProductRepository(_db)
orders = Blueprint('order_manager', url_prefix='/orders')

# ===================================================================
# GET ALL ORDERS - Filtered by role
# ===================================================================
@orders.route('/')
@token_required
async def bp_get_orders(request):
    """Lấy danh sách đơn hàng theo filter - Role khác nhau có quyền xem khác nhau."""
    # Lấy filter từ request
    filter_obj = get_order_filter_request(request)
    
    # Lấy role và username từ user context
    user_role = request.ctx.user.get("role")
    username = request.ctx.user.get("username")
    
    # User: chỉ thấy order của chính mình
    if user_role == enum.User_Role.USER:
        # Ghi đè customer_id bằng username của user hiện tại
        filter_obj.customer_id = username
        orders_data = order_repo.get_orders_by_filter(filter_obj.to_dict())
        
        serialized_orders = [_serialize_order(order) for order in orders_data]
        if not serialized_orders:
            return json({"message": "Không có đơn hàng nào"}, status=200)
        return json({"orders": serialized_orders, "count": len(serialized_orders)}, status=200)
    
    # Admin: thấy toàn bộ orders
    elif user_role == enum.User_Role.ADMIN:
        orders_data = order_repo.get_orders_by_filter(filter_obj.to_dict())
        
        serialized_orders = [_serialize_order(order) for order in orders_data]
        if not serialized_orders:
            return json({"message": "Không có đơn hàng nào"}, status=200)
        return json({"orders": serialized_orders, "count": len(serialized_orders)}, status=200)
    
    # Guest hoặc role không xác định: không được phép
    return json({"error": "Không có quyền truy cập. Cần đăng nhập."}, status=403)


# ===================================================================
# CREATE ORDER - User only
# ===================================================================
@orders.route('/', methods=['PUT'])
@token_required
@require_role(enum.User_Role.USER)
async def bp_create_order(request):
    """Tạo đơn hàng mới - Chỉ User.
    
    Yêu cầu người dùng phải cung cấp:
    - shipping_address: Địa chỉ giao hàng (object)
    - items: Danh sách sản phẩm trong đơn hàng (array, tối thiểu 1 item)
    - payment_method: Phương thức thanh toán (mặc định: cod - tiền mặt)
    """
    try:
        order_data = request.json or {}
        
        # Force assign current user as owner
        username = request.ctx.user.get("username")
        if not username:
            return json({"error": "Không xác định được người dùng"}, status=400)
        order_data["user_id"] = username

        # Validate required user input: shipping_address and items
        if not order_data.get("shipping_address"):
            return json({"error": "Địa chỉ giao hàng là bắt buộc"}, status=400)
        
        if not order_data.get("items") or len(order_data.get("items", [])) == 0:
            return json({"error": "Danh sách sản phẩm không được rỗng"}, status=400)

        total_price = 0
        for item in order_data["items"]:
            if item.get("product_id") is None or item.get("name") is None or item.get("price") is None or item.get("quantity") is None:
                return json({"error": "Mỗi sản phẩm phải có product_id, name, price và quantity"}, status=400)
            product_id = item["product_id"]
            product = product_repo.get_product_by_code(product_id)
            if not product:
                return json({"error": f"Sản phẩm với product_id {product_id} không tồn tại"}, status=400)
            else:
                total_price += product.get("sell_price") * item.get("quantity")
        
        order_data["price"] = round(total_price, 2)

        # Set default payment_method to cod (cash on delivery) if not provided
        order_data.setdefault("payment_method", "cod")

        # Generate random order_id with prefix if missing
        order_data.setdefault(
            "order_id",
            f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        )

        # Validate payload against schema
        validate_data(order_data, create_order_schema)

        # Insert into database
        inserted_id = order_repo.insert_order(order_data)
        if not inserted_id:
            return json({"error": "Không thể tạo đơn hàng"}, status=500)

        # Fetch created order by order_id
        created_order = order_repo.get_order_by_id(order_data["order_id"])

        return json({
            "success": "Tạo đơn hàng thành công",
            "order": _serialize_order(created_order)
        }, status=201)

    except ValidationError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)

