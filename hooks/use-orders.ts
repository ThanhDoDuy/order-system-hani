"use client"

import { useState, useEffect } from "react"
import { api, Order, CreateOrderRequest } from "@/lib/api"

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const addOrder = async (orderData: CreateOrderRequest) => {
    try {
      setError(null)
      const newOrder = await api.createOrder(orderData)
      setOrders((prev) => [...prev, newOrder])
      return newOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
      console.error('Error creating order:', err)
      throw err
    }
  }

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      setError(null)
      const updatedOrder = await api.updateOrder(id, orderData)
      setOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder : order)))
      return updatedOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
      console.error('Error updating order:', err)
      throw err
    }
  }

  const deleteOrder = async (id: string) => {
    try {
      setError(null)
      await api.deleteOrder(id)
      setOrders((prev) => prev.filter((order) => order.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order')
      console.error('Error deleting order:', err)
      throw err
    }
  }

  return {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  }
} 