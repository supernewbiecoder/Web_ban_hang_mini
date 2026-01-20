from backend.constants.enum import Product_Status,Supplier_Status
def product_list_view(products_data):
    result = []
    for product in products_data:
        if product.get("status") == Product_Status.ACTIVE:
            result.append({
                "name": product.get("name"),
                "code": product.get("code"),
                "category": product.get("category"),
                "sell_price": product.get("sell_price"),
                "total_quantity": product.get("total_quantity")
            })
    return result

def supplier_list_view(suppliers_data):
    result = []
    for supplier in suppliers_data:
        if supplier.get("status") == Supplier_Status.ACTIVE:
            result.append({
                "supplier_code": supplier.get("code"),
                "supplier_name": supplier.get("name"),
                "address": supplier.get("address"),
                "phone": supplier.get("phone"),
                "email": supplier.get("email")
            })
    return result