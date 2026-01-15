from bson import ObjectId

__all__ = ["product_list_view","_serialize_product"]

def _serialize_object(obj: dict) -> dict:
    """Convert MongoDB ObjectId to string for JSON serialization."""
    if isinstance(obj.get("_id"), ObjectId):
        obj["_id"] = str(obj["_id"])
    return obj

def product_list_view(products_data):
    serialized_products = [_serialize_object(p) for p in products_data]
    return {"products": serialized_products,"count": len(serialized_products)}

def supplier_list_view(suppliers_data):
    serialized_suppliers = []
    for p in suppliers_data:
        serialized_suppliers.append(_serialize_object(p))
    return {"suppliers": serialized_suppliers, "count": len(serialized_suppliers)}