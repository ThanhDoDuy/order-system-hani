import { config } from './config'

const API_BASE_URL = config.api.baseUrl;

// Backend Types (as returned from API)
interface BackendProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  status: "in_stock" | "out_of_stock";
  createdAt: string;
  updatedAt: string;
}

interface BackendOrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  unit: string;
  totalPrice: number;
}

interface BackendOrder {
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
  items: BackendOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// Frontend Types (as expected by components)
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  status: "in_stock" | "out_of_stock";
  created_at: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  unit: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  totalPrice?: number;
  notes?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    unit: string;
    totalPrice: number;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shippingFee: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  unit: string;
  status: "in_stock" | "out_of_stock";
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  status?: "in_stock" | "out_of_stock";
}

// Data transformation functions
function transformProduct(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct._id,
    name: backendProduct.name,
    description: backendProduct.description,
    price: backendProduct.price,
    unit: backendProduct.unit,
    status: backendProduct.status,
    created_at: backendProduct.createdAt,
  };
}

function transformOrderItem(backendItem: BackendOrderItem): OrderItem {
  return {
    productId: backendItem.productId,
    productName: backendItem.productName,
    productPrice: backendItem.productPrice,
    quantity: backendItem.quantity,
    unit: backendItem.unit,
    totalPrice: backendItem.totalPrice,
  };
}

function transformOrder(backendOrder: BackendOrder): Order {
  return {
    id: backendOrder._id,
    orderNumber: backendOrder.orderNumber,
    customerName: backendOrder.customerName,
    customerPhone: backendOrder.customerPhone,
    customerAddress: backendOrder.customerAddress,
    subtotal: backendOrder.subtotal,
    shippingFee: backendOrder.shippingFee,
    total: backendOrder.total,
    notes: backendOrder.notes,
    status: backendOrder.status,
    createdAt: backendOrder.createdAt,
    items: backendOrder.items?.map(transformOrderItem) ?? [],
  };
}

// API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Products API
  async getProducts(): Promise<Product[]> {
    const backendProducts = await this.request<BackendProduct[]>('/cms/products');
    return backendProducts.map(transformProduct);
  }

  async getProduct(id: string): Promise<Product> {
    const backendProduct = await this.request<BackendProduct>(`/cms/products/${id}`);
    return transformProduct(backendProduct);
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const backendProduct = await this.request<BackendProduct>('/cms/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return transformProduct(backendProduct);
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const backendProduct = await this.request<BackendProduct>(`/cms/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return transformProduct(backendProduct);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/cms/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    const backendOrders = await this.request<BackendOrder[]>('/cms/orders');
    return backendOrders.map(transformOrder);
  }

  async getOrder(id: string): Promise<Order> {
    const backendOrder = await this.request<BackendOrder>(`/cms/orders/${id}`);
    return transformOrder(backendOrder);
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const backendOrder = await this.request<BackendOrder>('/cms/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return transformOrder(backendOrder);
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const backendOrder = await this.request<BackendOrder>(`/cms/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return transformOrder(backendOrder);
  }

  async deleteOrder(id: string): Promise<void> {
    return this.request<void>(`/cms/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports API
  async getStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    avgOrderValue: number;
  }> {
    return this.request<{
      totalOrders: number;
      totalRevenue: number;
      totalProducts: number;
      avgOrderValue: number;
    }>('/cms/reports/stats');
  }

  async getOrderStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  }> {
    return this.request<{
      pending: number;
      processing: number;
      completed: number;
      cancelled: number;
    }>('/cms/reports/order-stats');
  }

  async getRevenueByMonth(): Promise<Array<{
    month: number;
    revenue: number;
    count: number;
  }>> {
    const data = await this.request<Array<{
      _id: number;
      revenue: number;
      count: number;
    }>>('/cms/reports/revenue-by-month');
    
    return data.map(item => ({
      month: item._id,
      revenue: item.revenue,
      count: item.count,
    }));
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL); 