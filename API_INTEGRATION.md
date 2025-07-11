# CMS Order System - API Integration

This document describes the API integration between the frontend and backend for the CMS Order System.

## Backend Connection

The frontend is configured to connect to the backend at:
- **Development**: `http://localhost:8000/api/v1`
- **Production**: Set via `NEXT_PUBLIC_API_BASE_URL` environment variable

## API Endpoints

### Products
- `GET /cms/products` - Get all products
- `GET /cms/products/:id` - Get product by ID
- `POST /cms/products` - Create new product
- `PATCH /cms/products/:id` - Update product
- `DELETE /cms/products/:id` - Delete product

### Orders
- `GET /cms/orders` - Get all orders
- `GET /cms/orders/:id` - Get order by ID
- `POST /cms/orders` - Create new order
- `PATCH /cms/orders/:id` - Update order
- `DELETE /cms/orders/:id` - Delete order

### Reports
- `GET /cms/reports/stats` - Get general statistics
- `GET /cms/reports/order-stats` - Get order status statistics
- `GET /cms/reports/revenue-by-month` - Get monthly revenue data

## Data Transformation

The frontend automatically transforms backend data to match the expected format:

### Backend → Frontend Transformation

**Product:**
```typescript
// Backend
{
  _id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  status: "in_stock" | "out_of_stock";
  createdAt: string;
  updatedAt: string;
}

// Frontend
{
  id: string;           // _id transformed
  name: string;
  description?: string;
  price: number;
  unit: string;
  status: "in_stock" | "out_of_stock";
  created_at: string;   // createdAt transformed
}
```

**Order:**
```typescript
// Backend
{
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  notes?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderItems: BackendOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// Frontend
{
  id: string;                    // _id transformed
  order_number: string;          // orderNumber transformed
  customer_name: string;         // customerName transformed
  customer_phone: string;        // customerPhone transformed
  customer_address: string;      // customerAddress transformed
  subtotal: number;
  shipping_fee: number;          // shippingFee transformed
  total: number;
  notes?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;            // createdAt transformed
  order_items: OrderItem[];      // orderItems transformed
}
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the frontend root:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Start Backend

```bash
cd BE-nikki-cms-coffee
npm run start:dev
```

### 3. Start Frontend

```bash
cd cms-order-system
npm run dev
```

### 4. Test Connection

Run the test script to verify API connection:

```bash
cd cms-order-system
node test-api.js
```

## Error Handling

The frontend includes comprehensive error handling:

- **Network errors**: Displayed as toast notifications
- **Validation errors**: Shown in form fields
- **API errors**: Logged to console and displayed to user

## CORS Configuration

The backend is configured with CORS enabled for development:

```typescript
// Backend main.ts
app.enableCors({
  origin: true, // Allows all origins in development
  credentials: true,
});
```

## Development Workflow

1. **Backend changes**: Update schemas, services, or controllers
2. **Frontend updates**: API client automatically handles data transformation
3. **Testing**: Use the test script to verify endpoints
4. **Deployment**: Update environment variables for production

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure backend CORS is properly configured
2. **Connection refused**: Verify backend is running on port 8000
3. **Data format errors**: Check that transformation functions match backend schema
4. **Environment variables**: Ensure `.env.local` is properly configured

### Debug Steps

1. Check browser network tab for API requests
2. Verify backend logs for incoming requests
3. Test API endpoints directly with curl or Postman
4. Run the test script to isolate issues

## Production Deployment

For production deployment:

1. Set `NEXT_PUBLIC_API_BASE_URL` to your production backend URL
2. Configure CORS on backend to allow your frontend domain
3. Ensure HTTPS is used for both frontend and backend
4. Set up proper environment variables for each environment 