from sanic import Blueprint, json
from jsonschema import ValidationError

from backend.databases.supplier_collection import SupplierRepository
from backend.databases.mongodb import MongoDB
from backend.databases.product_collection import ProductRepository
from backend.decorators.auth import optional_auth, token_required, require_role
from backend.hooks.supplier_hook import get_filter_request
from backend.constants.enum import User_Role
from backend.models.supplier import create_supplier_schema, update_supplier_schema
from backend.utils.validation import validate_data
from backend.views.user_view import supplier_list_view

_db = MongoDB()
supplier_repo = SupplierRepository(_db)
product_repo = ProductRepository(_db)

suppliers = Blueprint('suppliers_manager', url_prefix='/suppliers')


def _serialize_supplier(supplier):
    """Serialize supplier ObjectId to string."""
    if supplier and "_id" in supplier:
        supplier["_id"] = str(supplier["_id"])
    return supplier


# ===================================================================
# GET ALL SUPPLIERS by filter
# ===================================================================
@suppliers.route('/')
@optional_auth
async def bp_get_suppliers(request):
    """Lấy danh sách nhà cung cấp theo filter.

    Role GUEST/USER: chỉ trả về thông tin cơ bản.
    Role ADMIN: trả về toàn bộ thông tin.
    """
    filter_obj = get_filter_request(request)
    suppliers_data = supplier_repo.get_suppliers_by_filter(filter_obj.to_dict())

    if not suppliers_data:
        return json({"message": "không có nhà cung cấp ứng với mô tả"}, status=404)

    user_role = request.ctx.user.get("role")
    if user_role in [User_Role.GUEST, User_Role.USER]:
        result = supplier_list_view(suppliers_data)
        return json({"suppliers": result, "count": len(result)}, status=200)
    elif user_role == User_Role.ADMIN:
        serialized = [_serialize_supplier(s) for s in suppliers_data]
        return json({"suppliers": serialized, "count": len(serialized)}, status=200)
    else:
        return json({"error": "Không có quyền truy cập"}, status=403)


# ===================================================================
# CREATE SUPPLIER - Admin only
# ===================================================================
@suppliers.route('/', methods=['POST'])
@token_required
@require_role(User_Role.ADMIN)
async def bp_create_supplier(request):
    """Thêm nhà cung cấp mới - Chỉ Admin."""
    try:
        supplier_data = request.json
        if not supplier_data:
            return json({"error": "Dữ liệu không hợp lệ"}, status=400)

        validate_data(supplier_data, create_supplier_schema)
        supplier_data.setdefault("status", "active")

        supplier_id = supplier_repo.insert_supplier(supplier_data)
        created_supplier = supplier_repo.get_supplier_by_object_id(supplier_id)

        return json({
            "success": "nhà cung cấp được thêm thành công",
            "data": _serialize_supplier(created_supplier)
        }, status=201)

    except ValidationError:
        return json({"error": "dữ liệu không đúng định dạng schema"}, status=400)
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# UPDATE SUPPLIER - Admin only
# ===================================================================
@suppliers.route('/<supplier_id>', methods=['PATCH'])
@token_required
@require_role(User_Role.ADMIN)
async def bp_update_supplier(request, supplier_id):
    """Cập nhật thông tin nhà cung cấp - Chỉ Admin."""
    try:
        supplier = supplier_repo.get_supplier_by_object_id(supplier_id)
        if not supplier:
            return json({"error": "Nhà cung cấp không tồn tại"}, status=400)

        update_data = request.json
        if not update_data:
            return json({"error": "Dữ liệu cập nhật không hợp lệ"}, status=400)

        validate_data(update_data, update_supplier_schema)

        supplier_code = supplier.get("code")
        success = supplier_repo.update_supplier(supplier_code, update_data)

        if not success:
            return json({"error": "Cập nhật không thành công"}, status=400)

        updated_supplier = supplier_repo.get_supplier_by_code(supplier_code)
        return json({
            "success": "Cập nhật thành công",
            "data": _serialize_supplier(updated_supplier)
        }, status=200)

    except ValidationError:
        return json({"error": "dữ liệu không đúng định dạng schema"}, status=400)
    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# DELETE SUPPLIER - Admin only
# ===================================================================
@suppliers.route('/<supplier_id>', methods=['DELETE'])
@token_required
@require_role(User_Role.ADMIN)
async def bp_delete_supplier(request, supplier_id):
    """Xóa nhà cung cấp - Chỉ Admin.

    Ràng buộc: Nhà cung cấp phải inactive & không còn sản phẩm liên kết.
    """
    try:
        supplier = supplier_repo.get_supplier_by_object_id(supplier_id)
        if not supplier:
            return json({"error": "Nhà cung cấp không tồn tại"}, status=400)

        supplier_code = supplier.get("code")

        products = product_repo.get_products_by_supplier(supplier_code)
        if products:
            return json({
                "error": "Không thể xóa nhà cung cấp đang có sản phẩm liên kết"
            }, status=400)

        supplier_repo.delete_supplier(supplier_code)

        return json({
            "success": "Xóa nhà cung cấp thành công",
            "data": _serialize_supplier(supplier)
        }, status=200)

    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# SET SUPPLIER INACTIVE - Admin only
# ===================================================================
@suppliers.route('/inactive/<supplier_id>', methods=['PATCH'])
@token_required
@require_role(User_Role.ADMIN)
async def bp_inactive_supplier(request, supplier_id):
    """Chuyển nhà cung cấp sang trạng thái inactive - Chỉ Admin."""
    try:
        supplier = supplier_repo.get_supplier_by_object_id(supplier_id)
        if not supplier:
            return json({"error": "Nhà cung cấp không tồn tại"}, status=400)

        supplier_code = supplier.get("code")

        if supplier.get("status") == "inactive":
            return json({
                "message": "Nhà cung cấp đã ở sẵn trạng thái inactive",
                "data": _serialize_supplier(supplier)
            }, status=200)

        supplier_repo.update_supplier(supplier_code, {"status": "inactive"})
        updated_supplier = supplier_repo.get_supplier_by_code(supplier_code)

        return json({
            "success": "inactive thành công",
            "data": _serialize_supplier(updated_supplier)
        }, status=200)

    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)


# ===================================================================
# SET SUPPLIER ACTIVE - Admin only
# ===================================================================
@suppliers.route('/active/<supplier_id>', methods=['PATCH'])
@token_required
@require_role(User_Role.ADMIN)
async def bp_active_supplier(request, supplier_id):
    """Kích hoạt lại nhà cung cấp sang trạng thái active - Chỉ Admin."""
    try:
        supplier = supplier_repo.get_supplier_by_object_id(supplier_id)
        if not supplier:
            return json({"error": "Nhà cung cấp không tồn tại"}, status=400)

        supplier_code = supplier.get("code")

        if supplier.get("status") == "active":
            return json({
                "message": "Nhà cung cấp đã ở sẵn trạng thái active",
                "data": _serialize_supplier(supplier)
            }, status=200)

        supplier_repo.update_supplier(supplier_code, {"status": "active"})
        updated_supplier = supplier_repo.get_supplier_by_code(supplier_code)

        return json({
            "success": "active thành công",
            "data": _serialize_supplier(updated_supplier)
        }, status=200)

    except ValueError as e:
        return json({"error": str(e)}, status=400)
    except Exception as e:
        return json({"error": f"Lỗi server: {str(e)}"}, status=500)
