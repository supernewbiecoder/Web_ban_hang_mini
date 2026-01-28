import logging
from sanic import Blueprint, json
from jsonschema import ValidationError

from backend.databases.mongodb import MongoDB
from backend.databases.cart_collection import CartRepository
from backend.databases.product_collection import ProductRepository
from backend.decorators.auth import token_required
from backend.models.cart import add_to_cart_schema, update_cart_item_schema
from backend.utils.validation import validate_data

# Initialize database and repositories
_db = MongoDB()
cart_repo = CartRepository(_db)
product_repo = ProductRepository(_db)
logger = logging.getLogger(__name__)

# Create blueprint
cart = Blueprint('cart_manager', url_prefix='/cart')


def _serialize_cart(cart_data):
    """Serialize cart data for response"""
    if not cart_data:
        return None
    
    items = cart_data.get("items", [])
    total_price = round(sum(item.get("price", 0) * item.get("quantity", 0) for item in items), 2)
    total_items = sum(item.get("quantity", 0) for item in items)
    
    return {
        "username": cart_data.get("username"),
        "items": items,
        "total_price": total_price,
        "total_items": total_items,
        "updated_at": cart_data.get("updated_at")
    }


# ===================================================================
# GET CART - Get user's shopping cart
# ===================================================================
@cart.route('/')
@token_required
async def bp_get_cart(request):
    """Lấy giỏ hàng của user hiện tại"""
    try:
        username = request.ctx.user.get("username")
        if not username:
            return json({"error": "Không xác định được người dùng"}, status=400)
        
        cart_data = cart_repo.get_or_create_cart(username)
        result = _serialize_cart(cart_data)
        
        return json({
            "success": True,
            "cart": result
        }, status=200)
    
    except Exception as e:
        logger.exception("Error get cart")
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# ADD ITEM TO CART - Add product to shopping cart
# ===================================================================
@cart.route('/', methods=['PUT'])
@token_required
async def bp_add_to_cart(request):
    """Thêm sản phẩm vào giỏ hàng
    
    Yêu cầu:
    - product_id: ID sản phẩm
    - product_name: Tên sản phẩm
    - price: Giá sản phẩm
    - quantity: Số lượng (mặc định 1)
    - image_url: URL hình ảnh (tùy chọn)
    """
    try:
        username = request.ctx.user.get("username")
        if not username:
            return json({"error": "Không xác định được người dùng"}, status=400)
        
        item_data = request.json or {}
        
        # Validate schema
        validate_data(item_data, add_to_cart_schema)
        
        # Kiểm tra sản phẩm có tồn tại không (tùy chọn, để đảm bảo tính toàn vẹn)
        product_id = item_data.get("product_id")
        # product_id ở frontend đang là code; dùng get_product_by_code
        product = product_repo.get_product_by_code(product_id)
        if not product:
            return json({"error": f"Sản phẩm với ID {product_id} không tồn tại"}, status=404)
        
        # Kiểm tra số lượng hàng tồn kho
        available_quantity = product.get("total_quantity", 0)
        if available_quantity <= 0:
            return json({"error": "Sản phẩm đã hết hàng"}, status=400)
        
        # Thêm item vào giỏ
        success = cart_repo.add_item_to_cart(username, item_data)
        
        if not success:
            return json({"error": "Không thể thêm sản phẩm vào giỏ hàng"}, status=500)
        
        # Lấy giỏ hàng đã cập nhật
        updated_cart = cart_repo.get_cart_by_username(username)
        result = _serialize_cart(updated_cart)
        
        return json({
            "success": True,
            "message": "Thêm sản phẩm vào giỏ hàng thành công",
            "cart": result
        }, status=200)
    
    except ValidationError as e:
        return json({"error": f"Dữ liệu không hợp lệ: {str(e)}"}, status=400)
    except Exception as e:
        logger.exception("Error add to cart")
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# UPDATE CART ITEM - Update quantity of item in cart
# ===================================================================
@cart.route('/<product_id>', methods=['PATCH'])
@token_required
async def bp_update_cart_item(request, product_id):
    """Cập nhật số lượng sản phẩm trong giỏ hàng
    
    Yêu cầu:
    - quantity: Số lượng mới (nếu = 0 thì xóa item)
    """
    try:
        username = request.ctx.user.get("username")
        if not username:
            return json({"error": "Không xác định được người dùng"}, status=400)
        
        update_data = request.json or {}
        
        # Validate schema
        validate_data(update_data, update_cart_item_schema)
        
        new_quantity = update_data.get("quantity", 0)
        
        # Cập nhật số lượng
        success = cart_repo.update_item_quantity(username, product_id, new_quantity)
        
        if not success:
            return json({"error": "Không thể cập nhật giỏ hàng"}, status=400)
        
        # Lấy giỏ hàng đã cập nhật
        updated_cart = cart_repo.get_cart_by_username(username)
        result = _serialize_cart(updated_cart)
        
        if new_quantity == 0:
            message = "Xóa sản phẩm khỏi giỏ hàng thành công"
        else:
            message = f"Cập nhật số lượng thành công"
        
        return json({
            "success": True,
            "message": message,
            "cart": result
        }, status=200)
    
    except ValidationError as e:
        return json({"error": f"Dữ liệu không hợp lệ: {str(e)}"}, status=400)
    except Exception as e:
        logger.exception("Error update cart item")
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# REMOVE ITEM FROM CART - Delete single item from cart
# ===================================================================
@cart.route('/<product_id>', methods=['DELETE'])
@token_required
async def bp_remove_from_cart(request, product_id):
    """Xóa một sản phẩm khỏi giỏ hàng"""
    try:
        username = request.ctx.user.get("username")
        if not username:
            return json({"error": "Không xác định được người dùng"}, status=400)
        
        # Xóa item
        success = cart_repo.remove_item_from_cart(username, product_id)
        
        if not success:
            return json({"error": "Sản phẩm không tồn tại trong giỏ hàng"}, status=404)
        
        # Lấy giỏ hàng đã cập nhật
        updated_cart = cart_repo.get_cart_by_username(username)
        result = _serialize_cart(updated_cart)
        
        return json({
            "success": True,
            "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
            "cart": result
        }, status=200)
    
    except Exception as e:
        logger.exception("Error remove cart item")
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# CLEAR CART - Clear all items from cart
# ===================================================================
@cart.route('/', methods=['DELETE'])
@token_required
async def bp_clear_cart(request):
    """Xóa toàn bộ sản phẩm trong giỏ hàng"""
    try:
        username = request.ctx.user.get("username")
        if not username:
            return json({"error": "Không xác định được người dùng"}, status=400)
        
        # Xóa toàn bộ items
        success = cart_repo.clear_cart(username)
        
        if not success:
            return json({"error": "Không thể xóa giỏ hàng"}, status=500)
        
        # Lấy giỏ hàng đã cập nhật
        updated_cart = cart_repo.get_cart_by_username(username)
        result = _serialize_cart(updated_cart)
        
        return json({
            "success": True,
            "message": "Xóa toàn bộ sản phẩm thành công",
            "cart": result
        }, status=200)
    
    except Exception as e:
        logger.exception("Error clear cart")
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)
