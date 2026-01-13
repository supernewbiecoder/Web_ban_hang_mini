"""
Seed dữ liệu vào MongoDB cho các collection: users, suppliers, products, batches
"""
from backend.databases.mongodb import MongoDB
from backend.databases.user_collection import UserRepository
from backend.databases.supplier_collection import SupplierRepository
from backend.databases.product_collection import ProductRepository

from backend.data.user_data import USERS_DATA
from backend.data.supplier_data import SUPPLIERS_DATA
from backend.data.product_data import PRODUCTS_DATA


def seed_users(user_repo: UserRepository, users_data: list):
    """Seed dữ liệu users vào MongoDB"""
    print("🔄 Seeding users...")
    count = 0
    for user_data in users_data:
        try:
            user_repo.insert_user(user_data)
            count += 1
            print(f"  ✓ User '{user_data['username']}' created")
        except ValueError as e:
            print(f"  ⚠️  {str(e)}")
        except Exception as e:
            print(f"  ❌ Error creating user: {str(e)}")
    print(f"✅ Seeded {count}/{len(users_data)} users\n")
    return count


def seed_suppliers(supplier_repo: SupplierRepository, suppliers_data: list):
    """Seed dữ liệu suppliers vào MongoDB"""
    print("🔄 Seeding suppliers...")
    count = 0
    for supplier_data in suppliers_data:
        try:
            supplier_repo.insert_supplier(supplier_data)
            count += 1
            print(f"  ✓ Supplier '{supplier_data['code']}' created")
        except ValueError as e:
            print(f"  ⚠️  {str(e)}")
        except Exception as e:
            print(f"  ❌ Error creating supplier: {str(e)}")
    print(f"✅ Seeded {count}/{len(suppliers_data)} suppliers\n")
    return count


def seed_products(product_repo: ProductRepository, products_data: list):
    """Seed dữ liệu products vào MongoDB"""
    print("🔄 Seeding products...")
    count = 0
    for product_data in products_data:
        try:
            product_repo.insert_product(product_data)
            count += 1
            print(f"  ✓ Product '{product_data['code']}' created")
        except ValueError as e:
            print(f"  ⚠️  {str(e)}")
        except Exception as e:
            print(f"  ❌ Error creating product: {str(e)}")
    print(f"✅ Seeded {count}/{len(products_data)} products\n")
    return count





def seed_all():
    """Seed toàn bộ dữ liệu vào MongoDB"""
    print("=" * 60)
    print("🚀 STARTING DATABASE SEEDING")
    print("=" * 60 + "\n")

    try:
        # Khởi tạo MongoDB connection
        db = MongoDB()
        
        # Khởi tạo các repository
        user_repo = UserRepository(db)
        supplier_repo = SupplierRepository(db)
        product_repo = ProductRepository(db)

        # Seed dữ liệu theo thứ tự
        total_users = seed_users(user_repo, USERS_DATA)
        total_suppliers = seed_suppliers(supplier_repo, SUPPLIERS_DATA)
        total_products = seed_products(product_repo, PRODUCTS_DATA)

        # Tóm tắt kết quả
        print("=" * 60)
        print("📊 SEEDING SUMMARY")
        print("=" * 60)
        print(f"Users:     {total_users}/{len(USERS_DATA)}")
        print(f"Suppliers: {total_suppliers}/{len(SUPPLIERS_DATA)}")
        print(f"Products:  {total_products}/{len(PRODUCTS_DATA)}")
        print("=" * 60)
        print("✅ DATABASE SEEDING COMPLETED")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        raise


if __name__ == "__main__":
    seed_all()
