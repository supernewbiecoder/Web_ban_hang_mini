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
from bson import ObjectId

_db = MongoDB()
product_repo = ProductRepository(_db)
supplier_repo = SupplierRepository(_db)
products = Blueprint('products_manager', url_prefix='/products')


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
