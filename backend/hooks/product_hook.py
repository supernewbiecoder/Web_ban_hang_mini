from backend.constants.product_filter import Product_filter


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

def check_is_supplier_exist(supplier_repo, supplier_name, supplier_id):
    if supplier_name and not supplier_id:
        supplier = supplier_repo.get_supplier_by_name(supplier_name)
        if not supplier:
            return False, {"error": "Nhà cung cấp không tồn tại"}, 404
        supplier_id = supplier.get("code")  # Lấy code, không phải _id
    elif supplier_id and not supplier_name:
        supplier = supplier_repo.get_supplier_by_code(supplier_id)
        if not supplier:
            return False, {"error": "Nhà cung cấp không tồn tại"}, 404
        supplier_name = supplier.get("name")
    return True, (supplier_name, supplier_id)
    