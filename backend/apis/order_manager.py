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
            
            # Kiểm tra số lượng tồn kho
            available_qty = product.get("total_quantity", 0)
            requested_qty = item.get("quantity", 0)
            if requested_qty > available_qty:
                return json({
                    "error": f"Sản phẩm '{product.get('name')}' chỉ còn {available_qty} sản phẩm, bạn yêu cầu {requested_qty}. Vui lòng điều chỉnh số lượng."
                }, status=400)
            
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

        # Decrease product quantities after successful order creation
        for item in order_data.get("items", []):
            product_id = item.get("product_id")
            quantity = item.get("quantity", 0)
            if product_id and quantity > 0:
                try:
                    product_repo.decrease_quantity(product_id, quantity)
                except Exception as e:
                    # Log error but don't fail the order creation
                    print(f"Warning: Failed to decrease quantity for product {product_id}: {str(e)}")

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


# ===================================================================
# UPDATE ORDER STATUS - Admin only
# ===================================================================
@orders.route('/<order_id>', methods=['PATCH'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_update_order_status(request, order_id):
    """Cập nhật trạng thái đơn hàng - Chỉ Admin.
    
    Cho phép admin cập nhật:
    - order_status: trạng thái đơn hàng (processing, success, cancelled)
    - payment_status: trạng thái thanh toán (pending, completed)
    """
    try:
        update_data = request.json or {}
        
        if not update_data:
            return json({"error": "Dữ liệu cập nhật không hợp lệ"}, status=400)
        
        # Check if order exists
        order = order_repo.get_order_by_id(order_id)
        if not order:
            return json({"error": "Đơn hàng không tồn tại"}, status=404)
        
        # Only allow updating order_status and payment_status
        allowed_fields = {}
        if "order_status" in update_data:
            # Validate order_status values
            valid_statuses = ["processing", "success", "cancelled"]
            if update_data["order_status"] not in valid_statuses:
                return json({"error": f"Trạng thái đơn hàng không hợp lệ. Phải là một trong: {', '.join(valid_statuses)}"}, status=400)
            allowed_fields["order_status"] = update_data["order_status"]
        
        if "payment_status" in update_data:
            # Validate payment_status values
            valid_payment_statuses = ["pending", "completed"]
            if update_data["payment_status"] not in valid_payment_statuses:
                return json({"error": f"Trạng thái thanh toán không hợp lệ. Phải là một trong: {', '.join(valid_payment_statuses)}"}, status=400)
            allowed_fields["payment_status"] = update_data["payment_status"]
        
        if not allowed_fields:
            return json({"error": "Không có trường nào được cập nhật"}, status=400)
        
        # Update order
        success = order_repo.update_order(order_id, allowed_fields)
        
        if not success:
            return json({"error": "Cập nhật không thành công"}, status=400)
        
        # Fetch updated order
        updated_order = order_repo.get_order_by_id(order_id)
        
        return json({
            "success": "Cập nhật đơn hàng thành công",
            "order": _serialize_order(updated_order)
        }, status=200)
    
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)
