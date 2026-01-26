from jsonschema import ValidationError
from sanic import Blueprint, json

from backend.constants import enum
from backend.databases.mongodb import MongoDB
from backend.databases.product_collection import ProductRepository
from backend.databases.supplier_collection import SupplierRepository
from backend.decorators import optional_auth, token_required, require_role
from backend.hooks.product_hook import (
    get_filter_request,
    is_product_not_duplicate
)
from backend.models.product import create_product_schema,filter_product_schema
from backend.utils.validation import validate_data
from backend.views.user_view import product_list_view

# Initialize database and repositories
_db = MongoDB()
product_repo = ProductRepository(_db)
supplier_repo = SupplierRepository(_db)

# Create blueprint
products = Blueprint('products_manager', url_prefix='/products')


# Helper function
def _serialize_product(product):
    """Serialize product ObjectId to string."""
    if product and "_id" in product:
        product["_id"] = str(product["_id"])
    return product


# ===================================================================
# GET ALL PRODUCTS - Filtered by role
# ===================================================================
@products.route('/')
@optional_auth
async def bp_get_products(request):
    """Lấy danh sách sản phẩm theo filter - Role khác nhau có quyền xem khác nhau."""
    try:
        validate_data(request.args, filter_product_schema)
    except ValidationError as e:
        return json({"error": "Payload không hợp lệ", "details": e.message}, status=400)
    # Lấy filter từ request
    filter_obj = get_filter_request(request)
    
    # Nếu filter theo supplier (id hoặc name) thì đối chiếu và điền đủ thông tin
    if filter_obj.supplier_id or filter_obj.supplier_name:
        supplier_doc = None
        if filter_obj.supplier_id:
            is_exist, supplier_payload, status = supplier_repo.is_supplier_exist(
                filter_obj.supplier_id
            )
            if not is_exist:
                return json(supplier_payload, status=status)
            supplier_doc = supplier_payload
        elif filter_obj.supplier_name:
            supplier_doc = supplier_repo.get_supplier_by_name(filter_obj.supplier_name)
            if not supplier_doc:
                return json({"error": "Nhà cung cấp không tồn tại"}, status=400)

        filter_obj.supplier_name = supplier_doc.get("name")
        filter_obj.supplier_id = supplier_doc.get("code")

    # Lấy products từ database
    products_data = product_repo.get_products_by_filter(filter_obj.to_dict())
    
    # Lấy role từ user context
    user_role = request.ctx.user.get("role")
    
    # Guest/User: chỉ thấy sản phẩm active
    if user_role in [enum.User_Role.GUEST, enum.User_Role.USER]:
        result = product_list_view(products_data)
        if not result:
            return json({"message": "Không có sản phẩm nào"}, status=200)
        return json({"products": result, "count": len(result)}, status=200)
    
    # Admin: thấy toàn bộ
    elif user_role == enum.User_Role.ADMIN:
        result = product_list_view(products_data)
        if not result:
            return json({"message": "Không có sản phẩm nào"}, status=200)
        return json({"products": result, "count": len(result)}, status=200)
    
    # Role không xác định
    return json({"error": "Không có quyền truy cập"}, status=403)


# ===================================================================
# CREATE PRODUCT - Admin only
# ===================================================================
@products.route('/', methods=['PUT'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_create_product(request):
    """Tạo sản phẩm mới - Chỉ Admin."""
    try:
        product_data = request.json
        if not product_data:
            return json({"error": "Dữ liệu không hợp lệ"}, status=400)
        
        # Validate schema
        validate_data(product_data, create_product_schema)
        
        # Kiểm tra supplier tồn tại
        is_valid, supplier_payload, status = supplier_repo.is_supplier_exist(
            product_data.get("supplier_id")
        )
        if not is_valid:
            return json(supplier_payload, status=status)
        
        # Kiểm tra product chưa tồn tại
        is_valid, error_response = is_product_not_duplicate(
            product_repo, 
            product_data.get("code")
        )
        if not is_valid:
            return error_response
        
        # Set defaults
        product_data.setdefault("description", "")
        product_data.setdefault("total_quantity", 0)
        product_data.setdefault("status", enum.Product_Status.ACTIVE)
        
        # Insert vào database
        product_id = product_repo.insert_product(product_data)
        created_product = product_repo.get_product_by_object_id(product_id)
        
        return json({
            "success": "Sản phẩm được thêm vào thành công",
            "product": _serialize_product(created_product)
        }, status=201)
        
    except ValidationError as e:
        return json({"error": f"Dữ liệu không hợp lệ: {str(e)}"}, status=400)
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# SET PRODUCT INACTIVE - Admin only
# ===================================================================
@products.route('/inactive/<code>', methods=['PATCH'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_inactive_product(request, code):
    """Chuyển sản phẩm sang trạng thái inactive - Chỉ Admin."""
    try:
        # Kiểm tra sản phẩm tồn tại
        current_product = product_repo.get_product_by_code(code)
        if not current_product:
            return json({"error": "Sản phẩm không tồn tại trong hệ thống"}, status=400)
        
        # Kiểm tra đã inactive chưa
        if current_product.get("status") == enum.Product_Status.INACTIVE:
            return json({
                "message": "Sản phẩm đã ở trạng thái inactive rồi",
                "product": _serialize_product(current_product)
            }, status=200)
        
        # Cập nhật status
        product_repo.update_product(code, {"status": enum.Product_Status.INACTIVE})
        updated_product = product_repo.get_product_by_code(code)
        
        return json({
            "success": "Sản phẩm đã được chuyển thành inactive",
            "product": _serialize_product(updated_product)
        }, status=200)
        
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# SET PRODUCT ACTIVE - Admin only
# ===================================================================
@products.route('/active/<code>', methods=['PATCH'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_active_product(request, code):
    """Chuyển sản phẩm sang trạng thái active - Chỉ Admin."""
    try:
        # Kiểm tra sản phẩm tồn tại
        current_product = product_repo.get_product_by_code(code)
        if not current_product:
            return json({"error": "Sản phẩm không tồn tại trong hệ thống"}, status=400)
        
        # Kiểm tra đã active chưa
        if current_product.get("status") == enum.Product_Status.ACTIVE:
            return json({
                "message": "Sản phẩm đã ở trạng thái active rồi",
                "product": _serialize_product(current_product)
            }, status=200)
        
        # Cập nhật status
        product_repo.update_product(code, {"status": enum.Product_Status.ACTIVE})
        updated_product = product_repo.get_product_by_code(code)
        
        return json({
            "success": "Sản phẩm đã được chuyển thành active",
            "product": _serialize_product(updated_product)
        }, status=200)
        
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# DELETE PRODUCT - Admin only (inactive products only)
# ===================================================================
@products.route('/<code>', methods=['DELETE'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_delete_product_by_code(request, code):
    """Xóa sản phẩm - Chỉ xóa được sản phẩm inactive - Chỉ Admin."""
    try:
        deleted_product = product_repo.delete_product(code)
        return json({
            "success": "Xóa sản phẩm thành công",
            "product": _serialize_product(deleted_product)
        }, status=200)
        
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)
