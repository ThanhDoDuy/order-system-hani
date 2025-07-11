import Link from "next/link"
import { Package, ShoppingCart, FileText, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hệ thống CMS Nội bộ</h1>
        <p className="text-muted-foreground">Quản lý sản phẩm và đơn hàng cho công ty</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quản lý Sản phẩm</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Sản phẩm</div>
              <CardDescription>Thêm, sửa, xóa sản phẩm</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders/create">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tạo Đơn hàng</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Đơn hàng</div>
              <CardDescription>Tạo đơn hàng mới</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quản lý Đơn hàng</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Danh sách</div>
              <CardDescription>Xem và quản lý đơn hàng</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Báo cáo</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Thống kê</div>
              <CardDescription>Báo cáo doanh thu</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Chưa có hoạt động nào gần đây</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
