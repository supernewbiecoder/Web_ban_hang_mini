from backend.constants import enum
from backend.databases.mongodb import MongoDB
from backend.databases.product_collection import ProductRepository
from backend.databases.supplier_collection import SupplierRepository
from backend.decorators.__init__ import *
from sanic import Blueprint, json, text
from backend.constants.product_filter import Product_filter
from bson import ObjectId

_db = MongoDB()
product_repo = ProductRepository(_db)
supplier_repo = SupplierRepository(_db)
products = Blueprint('products_manager', url_prefix='/products')


def _serialize_product(product: dict) -> dict:
    """Convert MongoDB ObjectId to string for JSON serialization."""
    if isinstance(product.get("_id"), ObjectId):
        product["_id"] = str(product["_id"])
    return product


@products.route('/')
@optional_auth
async def bp_root(request):
    product_name = request.args.get("name")
    product_code = request.args.get("product_code")
    category = request.args.get("category")
    supplier_name = request.args.get("supplier_name")
    supplier_id = request.args.get("supplier_code")
    status = request.args.get("status")
    
    # Xử lý start/end an toàn
    try:
        start = int(request.args.get("start"))
    except (TypeError, ValueError):
        start = -1
    
    try:
        end = int(request.args.get("end"))
    except (TypeError, ValueError):
        end = -1
    
    # Kiểm tra nhà cung cấp tồn tại hay không
    if supplier_name and not supplier_id:
        supplier = supplier_repo.get_supplier_by_name(supplier_name)
        if not supplier:
            return json({"error": "Nhà cung cấp không tồn tại"}, status=404)
        supplier_id = supplier.get("code")  # Lấy code, không phải _id
    elif supplier_id and not supplier_name:
        supplier = supplier_repo.get_supplier_by_code(supplier_id)
        if not supplier:
            return json({"error": "Nhà cung cấp không tồn tại"}, status=404)
        supplier_name = supplier.get("name")
    
    filter_obj = Product_filter(
        product_name=product_name,
        product_code=product_code,
        category=category,
        supplier_name=supplier_name,
        supplier_id=supplier_id,
        status=status,
        start=start,
        end=end
    )
    
    # Lấy thông tin products từ filter
    products_data = product_repo.get_products_by_filter(filter_obj.to_dict())
    
    # Lấy role từ user context (dict, không phải object)
    user_role = request.ctx.user.get("role")
    
    # Guest hoặc User chỉ thấy sản phẩm active và thông tin giới hạn
    if user_role in [enum.User_Role.GUEST, enum.User_Role.USER]:
        result = []
        for product in products_data:
            if product.get("status") == "active":
                result.append({
                    "name": product.get("name"),
                    "code": product.get("code"),
                    "category": product.get("category"),
                    "sell_price": product.get("sell_price"),
                    "total_quantity": product.get("total_quantity")
                })
        return json({"products": result, "count": len(result)}, status=200)
    
    # Admin thấy toàn bộ thông tin
    elif user_role == enum.User_Role.ADMIN:
        serialized_products = [_serialize_product(p) for p in products_data]
        return json({"products": serialized_products, "count": len(serialized_products)}, status=200)
    
    # Role không xác định
    else:
        return json({"error": "Không có quyền truy cập"}, status=403)
