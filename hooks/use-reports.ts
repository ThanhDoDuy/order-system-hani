"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"

export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  avgOrderValue: number;
}

export interface OrderStats {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

export interface RevenueByMonth {
  month: number;
  revenue: number;
  count: number;
}

export function useReports() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    avgOrderValue: 0,
  })
  const [orderStats, setOrderStats] = useState<OrderStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  })
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderStats = async () => {
    try {
      setError(null)
      const data = await apiClient.getOrderStats()
      setOrderStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order stats')
      console.error('Error fetching order stats:', err)
    }
  }

  const fetchRevenueByMonth = async () => {
    try {
      setError(null)
      const data = await apiClient.getRevenueByMonth()
      setRevenueByMonth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue by month')
      console.error('Error fetching revenue by month:', err)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchOrderStats()
    fetchRevenueByMonth()
  }, [])

  return {
    stats,
    orderStats,
    revenueByMonth,
    loading,
    error,
    refetch: fetchStats,
    refetchOrderStats: fetchOrderStats,
    refetchRevenueByMonth: fetchRevenueByMonth,
  }
} 