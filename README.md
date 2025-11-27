# Smart Restaurant - Multi-Tenant QR Menu Ordering System

Hệ thống quản lý nhà hàng đa thuê bao với tính năng đặt món qua mã QR.

## 🏗️ Cấu trúc Dự án

```
project/
├── backend/          # NestJS API với MongoDB
├── frontend/         # React + Vite + TypeScript
└── shared/           # Shared types và utilities
```

## 🚀 Tech Stack

### Backend

- **Framework:** NestJS
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + Passport
- **Real-time:** Socket.IO
- **API Docs:** Swagger/OpenAPI

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **Router:** React Router v6

## 📋 Tính năng

### Multi-Tenant

✅ Đăng ký nhà hàng độc lập  
✅ Cô lập dữ liệu hoàn toàn  
✅ Super Admin quản lý toàn hệ thống

### Khách hàng

✅ Quét QR code tại bàn  
✅ Xem menu theo danh mục  
✅ Thêm vào giỏ hàng  
✅ Đặt món và thanh toán online  
✅ Theo dõi trạng thái đơn hàng real-time

### Quản lý Nhà hàng

✅ Quản lý menu (CRUD)  
✅ Tạo QR code cho từng bàn  
✅ Xem và cập nhật đơn hàng  
✅ Quản lý nhân viên  
✅ Báo cáo doanh số

### Kitchen Display System

✅ Hiển thị đơn hàng real-time  
✅ Cập nhật trạng thái món ăn  
✅ Kanban board (Pending/Preparing/Ready)

## 🛠️ Cài đặt và Chạy

### Yêu cầu

- Node.js 18+
- MongoDB 5.0+
- npm hoặc yarn

### 1. Cài đặt Backend

```powershell
cd backend
npm install
cp .env.example .env
# Cấu hình .env file với MongoDB URI và JWT secret
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:4000`  
API Documentation: `http://localhost:4000/api/docs`

### 2. Cài đặt Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📝 Cấu hình Environment

### Backend (.env)

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/smart_restaurant
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:4000/api
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tenant
- `POST /api/auth/login` - Đăng nhập

### Tenants

- `GET /api/tenants` - Danh sách tenants
- `GET /api/tenants/:id` - Chi tiết tenant
- `POST /api/tenants` - Tạo tenant mới
- `PATCH /api/tenants/:id` - Cập nhật tenant

### Menus

- `GET /api/menus?tenantId=xxx` - Danh sách món ăn
- `POST /api/menus` - Thêm món mới
- `PATCH /api/menus/:id` - Cập nhật món
- `DELETE /api/menus/:id` - Xóa món

### Tables

- `GET /api/tables?tenantId=xxx` - Danh sách bàn
- `POST /api/tables` - Tạo bàn với QR
- `GET /api/tables/qr/:qrCode` - Lấy thông tin bàn qua QR

### Orders

- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders?tenantId=xxx` - Danh sách đơn
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái

### Payments

- `POST /api/payments` - Tạo thanh toán
- `GET /api/payments/order/:orderId` - Chi tiết thanh toán

## 📱 Luồng sử dụng

### 1. Đăng ký Nhà hàng

1. Truy cập `/register`
2. Điền thông tin nhà hàng
3. Hệ thống tạo tenant và admin user

### 2. Cấu hình Menu

1. Đăng nhập admin
2. Thêm danh mục và món ăn
3. Upload hình ảnh, đặt giá

### 3. Tạo QR Code cho Bàn

1. Vào quản lý bàn
2. Tạo bàn mới (số bàn, số ghế)
3. Hệ thống tự tạo QR code
4. In QR code dán tại bàn

### 4. Khách hàng Đặt món

1. Quét QR code tại bàn
2. Xem menu
3. Thêm món vào giỏ
4. Xác nhận đặt món
5. Thanh toán (online hoặc tại quầy)

### 5. Bếp Xử lý

1. Nhân viên bếp xem KDS
2. Cập nhật trạng thái món
3. Thông báo real-time cho khách

## 🧪 Testing

```powershell
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 📦 Build Production

```powershell
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

## 🔐 Roles và Permissions

| Role         | Quyền                    |
| ------------ | ------------------------ |
| SUPER_ADMIN  | Toàn quyền hệ thống      |
| TENANT_ADMIN | Quản lý nhà hàng riêng   |
| STAFF        | Xem và cập nhật đơn hàng |
| CUSTOMER     | Xem menu và đặt món      |

## 📊 Database Schema (MongoDB Collections)

- **tenants** - Thông tin nhà hàng
- **users** - Người dùng (admin, staff, customer)
- **menus** - Món ăn
- **tables** - Bàn ăn và QR codes
- **orders** - Đơn hàng
- **payments** - Thanh toán

## 🚧 Roadmap

- [ ] Tích hợp Stripe/PayPal
- [ ] Chương trình loyalty cho khách hàng
- [ ] AI dự đoán doanh số
- [ ] Mobile app (React Native)
- [ ] Tích hợp GrabFood/ShopeeFood
- [ ] Voice ordering
- [ ] Multi-language support

## 👨‍💻 Phát triển bởi

Khanh Nguyen

## 📄 License

MIT License

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.
