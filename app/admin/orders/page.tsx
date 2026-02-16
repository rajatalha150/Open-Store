'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [editingTracking, setEditingTracking] = useState<{ [key: string]: boolean }>({})
  const [trackingNumbers, setTrackingNumbers] = useState<{ [key: string]: string }>({})
  const [notes, setNotes] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data.orders || [])

      // Initialize tracking numbers and notes state
      const initialTracking: { [key: string]: string } = {}
      const initialNotes: { [key: string]: string } = {}
      data.orders?.forEach((order: any) => {
        initialTracking[order.id] = order.tracking_number || ''
        initialNotes[order.id] = order.notes || ''
      })
      setTrackingNumbers(initialTracking)
      setNotes(initialNotes)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumbers[id] || null,
          notes: notes[id] || null
        })
      })

      if (res.ok) {
        fetchOrders()
      } else {
        const errorData = await res.json()
        alert(`Failed to update order: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order')
    }
  }

  const toggleTrackingEdit = (id: string) => {
    setEditingTracking(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const saveTrackingNumber = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'shipped', // Keep current status
          trackingNumber: trackingNumbers[id] || null,
          notes: notes[id] || null
        })
      })

      if (res.ok) {
        setEditingTracking(prev => ({
          ...prev,
          [id]: false
        }))
        fetchOrders()
      } else {
        const errorData = await res.json()
        alert(`Failed to save tracking: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to save tracking number:', error)
      alert('Failed to save tracking number')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.item_count} items</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingTracking[order.id] ? (
                      <div className="flex flex-col space-y-2">
                        <input
                          type="text"
                          value={trackingNumbers[order.id] || ''}
                          onChange={(e) => setTrackingNumbers(prev => ({
                            ...prev,
                            [order.id]: e.target.value
                          }))}
                          placeholder="Enter tracking number"
                          className="text-sm border rounded px-2 py-1 w-full"
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => saveTrackingNumber(order.id)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => toggleTrackingEdit(order.id)}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">
                          {order.tracking_number || 'No tracking'}
                        </div>
                        <button
                          onClick={() => toggleTrackingEdit(order.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          {order.tracking_number ? 'Edit' : 'Add Tracking'}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}