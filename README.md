# CMS Order System

Hệ thống quản lý đơn hàng và sản phẩm với giao diện web hiện đại.

## Tính năng

- **Quản lý sản phẩm**: Thêm, sửa, xóa sản phẩm
- **Quản lý đơn hàng**: Tạo và quản lý đơn hàng
- **Báo cáo**: Thống kê doanh thu và đơn hàng
- **Giao diện responsive**: Hoạt động tốt trên desktop và mobile

## Cài đặt

### Yêu cầu hệ thống

- Node.js 18+ 
- pnpm (khuyến nghị) hoặc npm
- Backend API chạy trên `http://localhost:8000`

### Cài đặt dependencies

```bash
pnpm install
```

### Cấu hình môi trường

1. Copy file môi trường:
```bash
cp env.example .env.local
```

2. Chỉnh sửa file `.env.local` với cấu hình backend của bạn:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Chạy ứng dụng

```bash
pnpm dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## API Endpoints

Hệ thống sử dụng API backend tại `http://localhost:8000/api/v1` với các endpoint sau:

### Products
- `GET /products` - Lấy danh sách sản phẩm
- `GET /products/{id}` - Lấy chi tiết sản phẩm
- `POST /products` - Tạo sản phẩm mới
- `PUT /products/{id}` - Cập nhật sản phẩm
- `DELETE /products/{id}` - Xóa sản phẩm

### Orders
- `GET /orders` - Lấy danh sách đơn hàng
- `GET /orders/{id}` - Lấy chi tiết đơn hàng
- `POST /orders` - Tạo đơn hàng mới
- `PUT /orders/{id}` - Cập nhật đơn hàng
- `DELETE /orders/{id}` - Xóa đơn hàng

### Reports
- `GET /reports/stats` - Lấy thống kê tổng quan

## Cấu trúc dự án

```
cms-order-system/
├── app/                    # Next.js app directory
│   ├── orders/            # Trang quản lý đơn hàng
│   ├── products/          # Trang quản lý sản phẩm
│   └── reports/           # Trang báo cáo
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── products/         # Product-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities và API client
└── scripts/              # SQL scripts cho database
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_stock',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Cấu hình Backend

Đảm bảo backend API của bạn:

1. Chạy trên `http://localhost:8000` (hoặc URL được cấu hình trong `.env.local`)
2. Có endpoint `/api/v1` 
3. Hỗ trợ CORS cho frontend
4. Trả về JSON response với cấu trúc phù hợp

### Biến môi trường

| Biến | Mô tả | Giá trị mặc định |
|------|-------|------------------|
| `NEXT_PUBLIC_API_BASE_URL` | URL backend API | `http://localhost:8000/api/v1` |

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra backend có đang chạy không
- Kiểm tra biến môi trường `NEXT_PUBLIC_API_BASE_URL` trong file `.env.local`
- Kiểm tra CORS configuration
- Đảm bảo đã copy `env.example` thành `.env.local` và cấu hình đúng

### Lỗi database
- Chạy script `scripts/create-tables.sql` để tạo bảng
- Chạy script `scripts/seed-data.sql` để thêm dữ liệu mẫu

## Công nghệ sử dụng

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **State Management**: React Hooks
- **API**: Fetch API với custom client
- **Database**: PostgreSQL (backend)

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License 