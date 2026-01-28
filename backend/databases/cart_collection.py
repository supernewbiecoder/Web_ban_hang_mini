from bson.objectid import ObjectId
from typing import Dict, List, Optional
from datetime import datetime


class CartRepository:
    """Repository để quản lý Cart trong MongoDB"""
    
    def __init__(self, db):
        """
        Args:
            db: MongoDB instance
        """
        self.db = db
        # MongoDB wrapper exposes client and db; use db.db to get database handle
        self.collection = db.db["carts"]
        # Tạo index để tìm cart nhanh hơn
        self.collection.create_index("username", unique=True)
    
    # ===================================================================
    # CREATE / INSERT
    # ===================================================================
    def create_cart(self, username: str) -> str:
        """Tạo giỏ hàng mới cho user"""
        cart_data = {
            "username": username,
            "items": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = self.collection.insert_one(cart_data)
        return str(result.inserted_id)
    
    # ===================================================================
    # READ / GET
    # ===================================================================
    def get_cart_by_username(self, username: str) -> Optional[Dict]:
        """Lấy giỏ hàng của user theo username"""
        return self.collection.find_one({"username": username})
    
    def get_or_create_cart(self, username: str) -> Dict:
        """Lấy giỏ hàng, nếu không có thì tạo mới"""
        cart = self.get_cart_by_username(username)
        if not cart:
            self.create_cart(username)
            cart = self.get_cart_by_username(username)
        return cart
    
    # ===================================================================
    # UPDATE
    # ===================================================================
    def add_item_to_cart(self, username: str, item: Dict) -> bool:
        """Thêm item vào giỏ hàng hoặc tăng số lượng nếu đã có"""
        cart = self.get_or_create_cart(username)
        
        # Kiểm tra xem product đã có trong giỏ không
        product_id = item.get("product_id")
        existing_item = None
        
        for idx, cart_item in enumerate(cart.get("items", [])):
            if cart_item.get("product_id") == product_id:
                existing_item = idx
                break
        
        if existing_item is not None:
            # Cập nhật số lượng nếu product đã tồn tại
            new_items = cart["items"]
            new_items[existing_item]["quantity"] += item.get("quantity", 1)
            new_items[existing_item]["price"] = item.get("price", new_items[existing_item]["price"])
        else:
            # Thêm item mới
            new_items = cart.get("items", [])
            new_items.append(item)
        
        # Cập nhật giỏ hàng
        result = self.collection.update_one(
            {"username": username},
            {
                "$set": {
                    "items": new_items,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0 or result.matched_count > 0
    
    def update_item_quantity(self, username: str, product_id: str, quantity: int) -> bool:
        """Cập nhật số lượng item trong giỏ"""
        cart = self.get_cart_by_username(username)
        if not cart:
            return False
        
        items = cart.get("items", [])
        for item in items:
            if item.get("product_id") == product_id:
                if quantity <= 0:
                    # Nếu quantity = 0, xóa item
                    items.remove(item)
                else:
                    # Cập nhật quantity
                    item["quantity"] = quantity
                break
        
        result = self.collection.update_one(
            {"username": username},
            {
                "$set": {
                    "items": items,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def clear_cart(self, username: str) -> bool:
        """Xóa toàn bộ items trong giỏ hàng"""
        result = self.collection.update_one(
            {"username": username},
            {
                "$set": {
                    "items": [],
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    # ===================================================================
    # DELETE
    # ===================================================================
    def remove_item_from_cart(self, username: str, product_id: str) -> bool:
        """Xóa một item khỏi giỏ hàng"""
        cart = self.get_cart_by_username(username)
        if not cart:
            return False
        
        items = cart.get("items", [])
        original_count = len(items)
        
        items = [item for item in items if item.get("product_id") != product_id]
        
        if len(items) == original_count:
            # Không tìm thấy item
            return False
        
        result = self.collection.update_one(
            {"username": username},
            {
                "$set": {
                    "items": items,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
