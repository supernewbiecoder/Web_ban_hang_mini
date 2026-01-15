from backend.constants.product_filter import Product_filter
from backend.utils.validation import validate_data
from backend.models.product import create_product_schema
from jsonschema import ValidationError
from sanic import json


def is_product_not_duplicate(product_repo, product_code):
    """
    Kiểm tra sản phẩm chưa tồn tại trong hệ thống
    
    Returns:
        tuple: (is_valid, error_response or None)
    """
    if not product_code:
        return False, json({"error": "code là bắt buộc"}, status=400)
    
    existing_product = product_repo.get_product_by_code(product_code)
    if existing_product:
        return False, json({"error": "sản phẩm đã được tạo trước đấy rồi"}, status=400)
    
    return True, None


def get_filter_request(request):
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
        num = int(request.args.get("num"))
    except (TypeError, ValueError):
        num = -1
    
    filter_obj = Product_filter(
        product_name=product_name,
        product_code=product_code,
        category=category,
        supplier_name=supplier_name,
        supplier_id=supplier_id,
        status=status,
        start=start,
        num=num
    )
    return filter_obj

    