"use client"

import { useState, useEffect } from "react"
import { api, Product, CreateProductRequest, UpdateProductRequest } from "@/lib/api"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addProduct = async (productData: CreateProductRequest) => {
    try {
      setError(null)
      const newProduct = await api.createProduct(productData)
      setProducts((prev) => [...prev, newProduct])
      return newProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
      console.error('Error creating product:', err)
      throw err
    }
  }

  const updateProduct = async (id: string, productData: UpdateProductRequest) => {
    try {
      setError(null)
      const updatedProduct = await api.updateProduct(id, productData)
      setProducts((prev) => prev.map((product) => (product.id === id ? updatedProduct : product)))
      return updatedProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      console.error('Error updating product:', err)
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      setError(null)
      await api.deleteProduct(id)
      setProducts((prev) => prev.filter((product) => product.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      console.error('Error deleting product:', err)
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  }
}
