
def product_list_view(products_data):
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
    return result
    