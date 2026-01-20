# Web Bán Hàng Online - Frontend

Website bán hàng online được xây dựng với React + Vite.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Build production

```bash
npm run build
```

## Tính năng

- 🛍️ Xem danh sách sản phẩm
- 🔍 Tìm kiếm và lọc sản phẩm
- 🛒 Giỏ hàng
- 📦 Đặt hàng
- 👤 Đăng nhập / Đăng ký
- 📋 Xem lịch sử đơn hàng
- 👨‍💼 Trang quản trị (Admin)

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/     # Các component tái sử dụng
│   ├── pages/         # Các trang chính
│   ├── services/      # API services
│   ├── context/       # React Context
│   ├── hooks/         # Custom hooks
│   ├── styles/        # CSS files
│   ├── App.jsx        # Component chính
│   └── main.jsx       # Entry point
├── public/            # Static files
└── package.json
```

## Backend API

Backend API cần chạy tại `http://localhost:8000` (hoặc cấu hình trong file `.env`)
