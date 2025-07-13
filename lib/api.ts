import { config } from './config'

// Use the config for API base URL
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
  private isRedirecting = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getDefaultConfig(options: RequestInit = {}): RequestInit {
    return {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      ...options,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = this.getDefaultConfig(options);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401 && !this.isRedirecting) {
          this.isRedirecting = true;
          
          // Clear invalid token
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
          document.cookie = 'user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
          
          // Only redirect if not already on login page and not making an auth-related request
          if (!window.location.pathname.includes('/login') && 
              !endpoint.includes('/auth/')) {
            window.location.href = '/login';
            throw new Error('Unauthorized - token invalid or expired');
          }
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error('No data received from server');
      }
      
      this.isRedirecting = false; // Reset the flag after successful request
      return JSON.parse(text);
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
    return this.request('/cms/reports/stats');
  }

  async getOrderStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  }> {
    return this.request('/cms/reports/order-stats');
  }

  async getRevenueByMonth(): Promise<Array<{
    month: number;
    revenue: number;
    count: number;
  }>> {
    return this.request('/cms/reports/revenue-by-month');
  }
}

// Create and export a singleton instance
export const api = new ApiClient(API_BASE_URL); 