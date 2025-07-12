'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOrders } from '@/hooks/use-orders';
import { useProducts } from '@/hooks/use-products';
import { useReports } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Package, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const { products, loading: productsLoading } = useProducts();
  const { stats, orderStats, revenueData, loading: reportsLoading } = useReports();

  const COLORS = ['#fbbf24', '#3b82f6', '#22c55e', '#ef4444'];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user?.picture} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{orderStats?.pending || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats?.avgOrderValue?.toLocaleString() || 0} avg. per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {products?.filter(p => p.status === 'out_of_stock').length || 0} out of stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Order Status</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats?.completed || 0}</div>
              <p className="text-xs text-muted-foreground">
                {orderStats?.processing || 0} in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current order status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {orderStats && (
                <PieChart width={500} height={300}>
                  <Pie
                    data={[
                      { name: 'Pending', value: orderStats.pending },
                      { name: 'Processing', value: orderStats.processing },
                      { name: 'Completed', value: orderStats.completed },
                      { name: 'Cancelled', value: orderStats.cancelled },
                    ]}
                    cx={250}
                    cy={150}
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Pending', value: orderStats.pending },
                      { name: 'Processing', value: orderStats.processing },
                      { name: 'Completed', value: orderStats.completed },
                      { name: 'Cancelled', value: orderStats.cancelled },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toString()} />
                  <Legend />
                </PieChart>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 