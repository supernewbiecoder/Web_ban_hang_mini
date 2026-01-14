from bson import ObjectId

__all__ = ["product_list_view","_serialize_product"]

def _serialize_product(product: dict) -> dict:
    """Convert MongoDB ObjectId to string for JSON serialization."""
    if isinstance(product.get("_id"), ObjectId):
        product["_id"] = str(product["_id"])
    return product

def product_list_view(products_data):
    serialized_products = [_serialize_product(p) for p in products_data]
    return {"products": serialized_products,"count": len(serialized_products)}
