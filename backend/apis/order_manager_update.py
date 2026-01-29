# PATCH endpoint to add to order_manager.py

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
