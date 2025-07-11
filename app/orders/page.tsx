"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Download, FileText, Pencil } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { orders, loading, error, deleteOrder, updateOrder } = useOrders()
  const { toast } = useToast()

  // Add state to track which order is being confirmed for delete
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
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

  const generatePDF = (order: Order) => {
    toast({
      title: "Xuất PDF",
      description: `Xuất PDF cho đơn hàng ${order.orderNumber} (Tính năng sẽ được triển khai)`,
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Chờ xử lý", variant: "secondary" as const },
      processing: { label: "Đang xử lý", variant: "default" as const },
      completed: { label: "Hoàn thành", variant: "default" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }

  const handleEditCustomer = (orderId: string, currentName: string) => {
    setEditingCustomerId(orderId)
    setEditingCustomerName(currentName)
  }

  const handleSaveCustomer = async (orderId: string) => {
    if (!editingCustomerName.trim()) return
    try {
      await updateOrder(orderId, { customerName: editingCustomerName.trim() })
      toast({ title: "Cập nhật tên khách hàng thành công!" })
    } catch (error) {
      toast({ title: "Cập nhật tên khách hàng thất bại!", variant: "destructive" })
    } finally {
      setEditingCustomerId(null)
      setEditingCustomerName("")
    }
  }

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
                            <FileText className="h-4 w-4" />
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
      {/* Thêm Dialog hiển thị chi tiết đơn hàng */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-2">
              <div><b>Mã đơn hàng:</b> {viewOrder.orderNumber}</div>
              <div><b>Khách hàng:</b> {viewOrder.customerName}</div>
              <div><b>Điện thoại:</b> {viewOrder.customerPhone}</div>
              <div><b>Địa chỉ:</b> {viewOrder.customerAddress}</div>
              <div><b>Trạng thái:</b> {statusOptions.find(opt => opt.value === viewOrder.status)?.label || viewOrder.status}</div>
              <div><b>Sản phẩm:</b>
                <ul className="list-disc ml-5">
                  {viewOrder.items.map((item, idx) => (
                    <li key={idx}>{item.productName} x{item.quantity}</li>
                  ))}
                </ul>
              </div>
              <div><b>Tổng tiền:</b> {viewOrder.total.toLocaleString("vi-VN")} VNĐ</div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button>Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
