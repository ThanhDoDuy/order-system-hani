"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  avgOrderValue: number
}

interface OrderStats {
  pending: number
  processing: number
  completed: number
  cancelled: number
}

interface RevenueData {
  month: number
  revenue: number
  count: number
}

export function useReports() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getStats()
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
      setLoading(true)
      setError(null)
      const data = await api.getOrderStats()
      setOrderStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order stats')
      console.error('Error fetching order stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getRevenueByMonth()
      setRevenueData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data')
      console.error('Error fetching revenue data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchOrderStats(),
      fetchRevenueData()
    ])
  }, [])

  return {
    stats,
    orderStats,
    revenueData,
    loading,
    error,
    refetch: () => Promise.all([
      fetchStats(),
      fetchOrderStats(),
      fetchRevenueData()
    ])
  }
} 