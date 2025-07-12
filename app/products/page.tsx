"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductDialog } from "@/components/products/product-dialog"
import { useProducts } from "@/hooks/use-products"
import { useToast } from "@/components/ui/use-toast"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts()
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: "Không load được sản phẩm",
        description: "Vui lòng thử lại hoặc kiểm tra kết nối.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id)
      } catch (error) {
        console.error('Failed to delete product:', error)
        toast({
          title: "Không thể xóa sản phẩm",
          description: "Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSave = async (productData: any) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await addProduct(productData)
      }
      setIsDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Failed to save product:', error)
      toast({
        title: "Không thể lưu sản phẩm",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Sản phẩm</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa sản phẩm trong hệ thống</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Lỗi khi tải dữ liệu
            </h3>
            <p className="text-gray-500 mb-4">
              {error}
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mx-auto"
            >
              Tải lại trang
            </Button>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác"
                : "Bắt đầu bằng cách thêm sản phẩm đầu tiên"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </div>
                  <Badge variant={product.status === "in_stock" ? "default" : "secondary"}>
                    {product.status === "in_stock" ? "Còn hàng" : "Hết hàng"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {product.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                )}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {product.price.toLocaleString("vi-VN")} VNĐ
                    </div>
                    <div className="text-sm text-gray-500">Đơn vị: {product.unit}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  )
}
