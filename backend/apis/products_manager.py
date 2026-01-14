from backend.constants import enum
from backend.databases.mongodb import MongoDB
from backend.databases.product_collection import ProductRepository
from backend.databases.supplier_collection import SupplierRepository
from backend.decorators.__init__ import *
from sanic import Blueprint, json, text
from backend.views.admin_view import *
from backend.views.user_view import *
from backend.hooks.product_hook import *
from backend.constants.product_filter import Product_filter
from backend.models.product import create_product_schema
from backend.utils.validation import validate_data
from bson import ObjectId
from jsonschema import ValidationError
from datetime import datetime

_db = MongoDB()
product_repo = ProductRepository(_db)
supplier_repo = SupplierRepository(_db)
products = Blueprint('products_manager', url_prefix='/products')

#--------------------------------------------------------------
#Xem tất cả sản phẩm dựa theo thông tin đã lọc, 3 role khác nhau sẽ trả về kqua khác nhau
#--------------------------------------------------------------
@products.route('/')
@optional_auth
async def bp_get_products(request):
    # Lấy filter từ request
    filter_obj = get_filter_request(request)
    
    # Kiểm tra nhà cung cấp tồn tại hay không
    is_exist, result = check_is_supplier_exist(supplier_repo, filter_obj.supplier_name, filter_obj.supplier_id)
    if not is_exist:
        return json(result[1], status=result[2])
    supplier_name, supplier_id = result

    #fill thông tin supplier vào filter cho chuẩn
    filter_obj.supplier_name = supplier_name
    filter_obj.supplier_id = supplier_id

    # Lấy thông tin products từ filter
    products_data = product_repo.get_products_by_filter(filter_obj.to_dict())
    
    # Lấy role từ user context (dict, không phải object)
    user_role = request.ctx.user.get("role")
    
    # Guest hoặc User chỉ thấy sản phẩm active và thông tin giới hạn
    if user_role in [enum.User_Role.GUEST, enum.User_Role.USER]:
        result = product_list_view(products_data)
        if not result:
            return json({"message": "Không có sản phẩm nào"}, status=200)
        return json({"products": result, "count": len(result)}, status=200)
    
    # Admin thấy toàn bộ thông tin
    elif user_role == enum.User_Role.ADMIN:
        result = product_list_view(products_data)
        if not result:
            return json({"message": "Không có sản phẩm nào"}, status=200)
        return json(result, status=200)
    
    # Role không xác định
    else:
        return json({"error": "Không có quyền truy cập"}, status=403)

#--------------------------------------------------------------
#Tạo sản phẩm
#--------------------------------------------------------------

@products.route('/', methods=['PUT'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_create_product(request):
    """
    Tạo sản phẩm mới - Chỉ Admin
    """
    try:
        # Lấy dữ liệu từ request body
        product_data = request.json
        if not product_data:
            return json({"error": "Dữ liệu không hợp lệ"}, status=400)
        
        # Validate dữ liệu theo schema
        try:
            validate_data(product_data, create_product_schema)
        except ValidationError as e:
            return json({"error": str(e)}, status=400)
        
        # Kiểm tra supplier có tồn tại không
        is_valid, result = is_supplier_exists(supplier_repo, product_data.get("supplier_id"))
        if not is_valid:
            return result
        
        # Kiểm tra sản phẩm chưa tồn tại
        is_valid, error_response = is_product_not_duplicate(product_repo, product_data.get("code"))
        if not is_valid:
            return error_response
        
        # Set default values
        product_data.setdefault("description", "")
        product_data.setdefault("total_quantity", 0)
        product_data.setdefault("status", enum.Product_Status.ACTIVE)
        
        # Lưu vào database
        product_id = product_repo.insert_product(product_data)
        
        # Lấy lại thông tin sản phẩm vừa tạo
        created_product = product_repo.get_product_by_object_id(product_id)
        
        # Serialize ObjectId
        created_product = _serialize_product(created_product)
        
        return json({
            "success": "sản phẩm được thêm vào thành công",
            "product": created_product
        }, status=201)
        
    except ValidationError as e:
        return json({"error": f"Dữ liệu không hợp lệ: {str(e)}"}, status=400)
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)

#--------------------------------------------------------------
#inactive sản phẩm
#--------------------------------------------------------------
@products.route('/inactive/<code>', methods=['PATCH'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_inactive_product(request, code):
    """
    Chuyển sản phẩm sang trạng thái inactive
    """
    try:
        # Kiểm tra sản phẩm có tồn tại không
        current_product = product_repo.get_product_by_code(code)
        if not current_product:
            return json({"error": "sản phẩm không tồn tại trong hệ thống"}, status=400)
        
        # Kiểm tra status hiện tại
        if current_product.get("status") == enum.Product_Status.INACTIVE:
            if "_id" in current_product:
                current_product["_id"] = str(current_product["_id"])
            return json({
                "message": "sản phẩm đã ở trạng thái inactive rồi",
                "product": current_product
            }, status=200)
        
        # Cập nhật status
        product_repo.update_product(code, {"status": enum.Product_Status.INACTIVE})
        
        # Lấy lại sản phẩm vừa update
        updated_product = product_repo.get_product_by_code(code)
        updated_product = _serialize_product(updated_product)
        
        return json({
            "success": "Sản phẩm đã được chuyển thành inactive",
            "product": updated_product
        }, status=200)
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)

#--------------------------------------------------------------
#active sản phẩm
#--------------------------------------------------------------
@products.route('/active/<code>', methods=['PATCH'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_active_product(request, code):
    """
    Chuyển sản phẩm sang trạng thái active
    """
    try:
        # Kiểm tra sản phẩm có tồn tại không
        current_product = product_repo.get_product_by_code(code)
        if not current_product:
            return json({"error": "sản phẩm không tồn tại trong hệ thống"}, status=400)
        
        # Kiểm tra status hiện tại
        if current_product.get("status") == enum.Product_Status.ACTIVE:
            if "_id" in current_product:
                current_product["_id"] = str(current_product["_id"])
            return json({
                "message": "sản phẩm đã ở trạng thái active rồi",
                "product": current_product
            }, status=200)
        
        # Cập nhật status
        product_repo.update_product(code, {"status": enum.Product_Status.ACTIVE})
        
        # Lấy lại sản phẩm vừa update
        updated_product = product_repo.get_product_by_code(code)
        updated_product = _serialize_product(updated_product)
        
        return json({
            "success": "Sản phẩm đã được chuyển thành active",
            "product": updated_product
        }, status=200)
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)

#--------------------------------------------------------------
#xóa sản phẩm đang inactive
#--------------------------------------------------------------
@products.route('/<code>', methods=['DELETE'])
@token_required
@require_role(enum.User_Role.ADMIN)
async def bp_delete_product_by_code(request, code):
    """
    Xóa sản phẩm (chỉ xóa được sản phẩm inactive)
    """
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
