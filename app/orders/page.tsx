"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Eye, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOrders } from "@/hooks/use-orders"
import { Order } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { InvoicePrint } from "@/components/products/InvoicePrint";

export function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-500">
          Hoàn thành
        </Badge>
      )
    case "processing":
      return <Badge variant="secondary">Đang xử lý</Badge>
    case "pending":
      return <Badge variant="outline">Chờ xử lý</Badge>
    case "cancelled":
      return <Badge variant="destructive">Đã hủy</Badge>
    default:
      return <Badge variant="outline">Không xác định</Badge>
  }
}

export function getVietQRUrl(amount: number, orderNumber: string) {
  const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID || '970443';
  const ACCOUNT_NO = process.env.NEXT_PUBLIC_ACCOUNT_NO || '02022122';
  const ACCOUNT_NAME = process.env.NEXT_PUBLIC_ACCOUNT_NAME || 'NGUYEN THI HONG VAN';
  const template = 'compact2';
  const addInfo = `don hang ${orderNumber}`;
  return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(ACCOUNT_NAME || '')}`;
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { orders, loading, error, deleteOrder, updateOrder } = useOrders()
  const { toast } = useToast()

  // Add state to track which order is being confirmed for delete
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const statusOptions = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "processing", label: "Đang xử lý" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ]

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [editingCustomerName, setEditingCustomerName] = useState<string>("")
  const [viewOrder, setViewOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (error) {
      toast({
        title: "Không load được đơn hàng",
        description: "Vui lòng thử lại hoặc kiểm tra kết nối.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : []

  const filteredOrders = safeOrders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  const handleDelete = async () => {
    if (!deleteOrderId) return
    try {
      await deleteOrder(deleteOrderId)
      toast({
        title: "Đã xóa đơn hàng",
        description: "Đơn hàng đã được xóa thành công.",
      })
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast({
        title: "Không thể xóa đơn hàng",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setDeleteOrderId(null)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus as "pending" | "processing" | "completed" | "cancelled" })
      toast({
        title: "Cập nhật trạng thái thành công!",
      })
    } catch (error) {
      toast({
        title: "Cập nhật trạng thái thất bại!",
        variant: "destructive",
      })
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Hóa đơn</title>');
      // Thêm link tới CSS nếu cần
      const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      styleLinks.forEach(link => {
        printWindow.document.write(link.outerHTML);
      });
      printWindow.document.write('</head><body>');
      // Render InvoicePrint ra string
      const container = document.createElement('div');
      // @ts-ignore
      import('react-dom/server').then(ReactDOMServer => {
        container.innerHTML = ReactDOMServer.renderToString(
          <InvoicePrint order={order} />
        );
        printWindow.document.body.innerHTML = container.innerHTML;
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý Đơn hàng</h1>
        <p className="text-muted-foreground">Xem và quản lý tất cả đơn hàng</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {error ? "Không load được đơn hàng" : searchTerm ? "Không tìm thấy đơn hàng nào" : "Chưa có đơn hàng nào"}
              <div className="text-gray-400 text-sm mt-2">
                {error
                  ? "Vui lòng thử lại hoặc kiểm tra kết nối."
                  : searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : ""}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(expandedOrders.includes(order.id) ? order.items : order.items?.slice(0, 2)).map((item, index) => (
                            <div key={index}>
                              {item.productName} x{item.quantity}
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <button
                              className="text-blue-500 underline text-xs ml-1"
                              onClick={() => toggleExpand(order.id)}
                              type="button"
                            >
                              {expandedOrders.includes(order.id)
                                ? "Thu gọn"
                                : `+${order.items.length - 2} sản phẩm khác`}
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{order.total.toLocaleString("vi-VN")} VNĐ</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateStatus(order.id, value as 'pending' | 'processing' | 'completed' | 'cancelled')}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteOrderId(order.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteOrderId(null)}>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog hiển thị chi tiết đơn hàng và hóa đơn */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-4xl">
          {viewOrder && (
            <div className="print-invoice-modal p-6 bg-white">
              {/* Header hóa đơn */}
              <div className="text-center border-b pb-4 avoid-break">
                <h3 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h3>
                <div className="flex justify-between text-sm mt-2">
                  <span>Mã đơn hàng: {viewOrder.orderNumber}</span>
                  <span>Ngày: {new Date(viewOrder.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Số TK: {process.env.NEXT_PUBLIC_ACCOUNT_NO}</span>
                  <span>{process.env.NEXT_PUBLIC_ACCOUNT_NAME}</span>
                </div>
                <div className="text-sm mt-1">{process.env.NEXT_PUBLIC_BANK_NAME || ''}</div>
              </div>

              {/* Thông tin khách hàng và trạng thái */}
              <div className="grid grid-cols-2 gap-4 text-sm avoid-break mt-4">
                <div>
                  <strong>Thông tin khách hàng:</strong>
                  <div>Họ tên: {viewOrder.customerName}</div>
                  <div>Điện thoại: {viewOrder.customerPhone}</div>
                  <div>Địa chỉ: {viewOrder.customerAddress}</div>
                </div>
                <div>
                  <strong>Trạng thái đơn hàng:</strong>
                  <div className="mt-1">{getStatusBadge(viewOrder.status)}</div>
                  {viewOrder.notes && (
                    <div className="mt-2">
                      <strong>Ghi chú:</strong> {viewOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Bảng chi tiết sản phẩm */}
              <div className="overflow-x-auto mt-4 avoid-break">
                <table className="invoice-table w-full border border-black text-sm">
                  <thead>
                    <tr>
                      <th className="border border-black px-2 py-2">STT</th>
                      <th className="border border-black px-2 py-2">Tên sản phẩm</th>
                      <th className="border border-black px-2 py-2">Đơn giá</th>
                      <th className="border border-black px-2 py-2">Số lượng</th>
                      <th className="border border-black px-2 py-2">Đơn vị</th>
                      <th className="border border-black px-2 py-2">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                        <td className="border border-black px-2 py-2">{item.productName}</td>
                        <td className="border border-black px-2 py-2 text-right">{item.productPrice.toLocaleString("vi-VN")}đ</td>
                        <td className="border border-black px-2 py-2 text-center">{item.quantity}</td>
                        <td className="border border-black px-2 py-2 text-center">{item.unit}</td>
                        <td className="border border-black px-2 py-2 text-right">{item.totalPrice.toLocaleString("vi-VN")}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tổng cộng */}
              <div className="flex justify-end mt-4 space-y-1 avoid-break">
                <div className="w-64 space-y-1">
                  <div className="flex justify-between">
                    <span>Tổng tiền hàng:</span>
                    <span>{viewOrder.subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{viewOrder.shippingFee.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-1">
                    <span>Tổng cộng:</span>
                    <span>{viewOrder.total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>

              {/* QR chuyển khoản chỉ hiện khi in */}
              <div className="print-qr flex flex-col items-center mt-6 avoid-break">
                <img
                  src={getVietQRUrl(viewOrder.total, viewOrder.orderNumber)}
                  alt="QR chuyển khoản"
                  style={{ width: 200, height: 200 }}
                />
                <div className="text-sm mt-2">
                  Quét mã để thanh toán đơn hàng
                </div>
              </div>

              {/* Nút In hóa đơn và Đóng - không in */}
              <div className="flex justify-center pt-4 no-print">
                <Button onClick={() => handlePrintInvoice(viewOrder!)} type="button" className="mr-2">
                  <Printer className="h-4 w-4 mr-2" />
                  In hóa đơn
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Đóng</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
