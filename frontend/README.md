# Web Bán Hàng Online - Frontend (React + Vite)

Frontend cho web bán hàng, kết nối backend Sanic tại `http://localhost:8000` (mặc định).

## Chạy nhanh

Tạo file `.env` trong thư mục `frontend` (tùy chọn):

```
VITE_API_URL=http://localhost:8000
```

Chạy dev server:

```
npm install
npm run dev
```

Mở http://localhost:5173

## Tính năng chính

- Đăng ký/Đăng nhập (JWT lưu trong localStorage)
- Danh sách sản phẩm (lọc cơ bản qua query)
- Giỏ hàng đồng bộ backend (/cart)
- Thanh toán tạo đơn (/orders)
- Lịch sử đơn hàng của người dùng

## Cấu trúc chính

- `src/services/*`: API layer (axios)
- `src/context/*`: Auth & Cart context
- `src/pages/*`: Trang Home, Products, Cart, Checkout, Orders, Login, Register
- `src/components/*`: Navbar, PrivateRoute, Loading
