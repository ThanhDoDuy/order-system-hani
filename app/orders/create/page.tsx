"use client"

import { useState } from "react"
import { Plus, Minus, ShoppingCart, Calculator, Package, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useProducts } from "@/hooks/use-products"
import { useOrders } from "@/hooks/use-orders"
import { useRouter } from "next/navigation"
import { CreateOrderRequest } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  unit: string
}

export default function CreateOrderPage() {
  const { products } = useProducts()
  const { createOrder } = useOrders()
  const router = useRouter()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [shippingFee, setShippingFee] = useState(0)
  const [notes, setNotes] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const existingItem = orderItems.find((item) => item.productId === productId)
    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          unit: product.unit,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prev) => prev.filter((item) => item.productId !== productId))
    } else {
      setOrderItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const removeProduct = (productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + shippingFee

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "Vui lòng thêm ít nhất một sản phẩm",
        variant: "destructive",
        duration: 3000,
        position: "top-center",
      })
      return
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin khách hàng",
        variant: "destructive",
        duration: 3000,
        position: "top-center",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        shippingFee: shippingFee,
        notes: notes || undefined,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      }

      await createOrder(orderData)
      toast({
        title: "Đơn hàng đã được tạo thành công!",
        variant: "success",
        duration: 3000,
        position: "top-center",
      })
      router.push("/orders")
    } catch (error) {
      console.error('Failed to create order:', error)
      toast({
        title: "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
        duration: 3000,
        position: "top-center",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tạo Đơn hàng</h1>
        <p className="text-muted-foreground">Tạo đơn hàng mới cho khách hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Chọn sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addProduct(product.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <span className="text-sm font-semibold">{product.price.toLocaleString("vi-VN")} VNĐ</span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Đơn vị: {product.unit}</span>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Tên khách hàng *</Label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Số điện thoại *</Label>
                <Input
                  id="customerPhone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <Label htmlFor="customerAddress">Địa chỉ *</Label>
                <Textarea
                  id="customerAddress"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Nhập địa chỉ giao hàng"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Sản phẩm đã chọn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Chưa có sản phẩm nào được chọn
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">
                          {item.price.toLocaleString("vi-VN")} VNĐ x {item.quantity} {item.unit}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeProduct(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Tổng đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shippingFee">Phí vận chuyển</Label>
                <Input
                  id="shippingFee"
                  type="number"
                  value={shippingFee === 0 ? '' : shippingFee}
                  onChange={(e) => {
                    // Remove leading zeros and allow clearing
                    const val = e.target.value.replace(/^0+/, '')
                    setShippingFee(val === '' ? 0 : Number(val))
                  }}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú cho đơn hàng"
                  rows={2}
                />
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng:</span>
                  <span>{total.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </div>
              <Button
                onClick={handleCreateOrder}
                disabled={isSubmitting || orderItems.length === 0}
                className="w-full"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
