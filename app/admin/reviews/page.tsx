'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Star, Trash2, X } from 'lucide-react'

interface AdminReview {
  id: number
  product_id: number
  product_name?: string
  customer_name?: string
  customer_email?: string
  rating: number
  review_title?: string
  review_text?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
}

interface ProductOption {
  id: number
  name: string
  sku?: string
}

interface ReviewForm {
  productId: string
  firstName: string
  lastName: string
  rating: number
  reviewTitle: string
  reviewText: string
  reviewDate: string
}

function getTodayDateInputValue() {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function getDefaultReviewForm(): ReviewForm {
  return {
    productId: '',
    firstName: '',
    lastName: '',
    rating: 5,
    reviewTitle: '',
    reviewText: '',
    reviewDate: getTodayDateInputValue(),
  }
}

function formatDate(date?: string) {
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString()
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<ReviewForm>(() => getDefaultReviewForm())

  useEffect(() => {
    fetchReviews()
    fetchProducts()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews', { cache: 'no-store' })
      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews || [])
      } else {
        setError(data.error || 'Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setError('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=500', { cache: 'no-store' })
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const openCreateModal = () => {
    setError('')
    setForm(getDefaultReviewForm())
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSaving(false)
    setError('')
    setForm(getDefaultReviewForm())
  }

  const updateReviewStatus = async (id: number, status: AdminReview['status']) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })

      if (response.ok) {
        fetchReviews()
      } else {
        const errorData = await response.json()
        alert(`Failed to update review: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to update review status:', error)
      alert('Failed to update review status')
    }
  }

  const deleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })

      if (response.ok) {
        fetchReviews()
      } else {
        const errorData = await response.json()
        alert(`Failed to delete review: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Failed to delete review')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: form.productId,
          firstName: form.firstName,
          lastName: form.lastName,
          rating: form.rating,
          reviewTitle: form.reviewTitle,
          reviewText: form.reviewText,
          reviewDate: form.reviewDate,
        }),
      })
      const data = await response.json()

      if (response.ok) {
        closeModal()
        fetchReviews()
      } else {
        setError(data.error || 'Failed to create review')
      }
    } catch (error) {
      console.error('Failed to create review:', error)
      setError('Failed to create review')
    } finally {
      setSaving(false)
    }
  }

  const renderStars = (rating: number, sizeClass = 'h-4 w-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-secondary-300'}`}
          />
        ))}
      </div>
    )
  }

  const todayDate = getTodayDateInputValue()

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Product Reviews</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add Review</span>
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-4 rounded border border-red-500 bg-red-500/20 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg bg-secondary-900 shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-800">
              <thead className="bg-secondary-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-800">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-secondary-400">
                      No reviews yet.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-secondary-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{review.product_name || `Product #${review.product_id}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-300">{review.customer_name || 'Anonymous'}</div>
                        {review.customer_email && (
                          <div className="text-sm text-secondary-400">{review.customer_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-secondary-300">({review.rating}/5)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs text-sm text-secondary-300" title={review.review_text}>
                          {review.review_title && <div className="font-medium text-secondary-100">{review.review_title}</div>}
                          <div className="truncate">{review.review_text}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                        {formatDate(review.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          review.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                          review.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          {review.status !== 'approved' && (
                            <button
                              onClick={() => updateReviewStatus(review.id, 'approved')}
                              className="text-green-500 hover:text-green-300"
                            >
                              Approve
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button
                              onClick={() => updateReviewStatus(review.id, 'rejected')}
                              className="text-red-500 hover:text-red-300"
                            >
                              Reject
                            </button>
                          )}
                          {review.status !== 'pending' && (
                            <button
                              onClick={() => updateReviewStatus(review.id, 'pending')}
                              className="text-yellow-500 hover:text-yellow-300"
                            >
                              Pending
                            </button>
                          )}
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="text-red-500 hover:text-red-300"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-secondary-900 p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">Add Review</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded bg-secondary-800 p-2 text-secondary-300 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded border border-red-500 bg-red-500/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-secondary-300">
                  Product
                  <select
                    value={form.productId}
                    onChange={(event) => setForm({ ...form, productId: event.target.value })}
                    className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-white"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}{product.sku ? ` (${product.sku})` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-secondary-300">
                    First Name
                    <input
                      value={form.firstName}
                      onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                      className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-white"
                      placeholder="First name"
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-secondary-300">
                    Last Name (optional)
                    <input
                      value={form.lastName}
                      onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                      className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-white"
                      placeholder="Last name"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-secondary-300">
                    Date
                    <input
                      type="date"
                      value={form.reviewDate}
                      max={todayDate}
                      onChange={(event) => setForm({ ...form, reviewDate: event.target.value })}
                      className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-white"
                      required
                    />
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300">Rating</label>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm({ ...form, rating: star })}
                          className="rounded p-1 hover:bg-secondary-800"
                          aria-label={`Set rating to ${star}`}
                        >
                          <Star
                            className={`h-6 w-6 ${star <= form.rating ? 'fill-current text-yellow-400' : 'text-secondary-500'}`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-secondary-400">({form.rating}/5)</span>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-secondary-300">
                  Review Title (optional)
                  <input
                    value={form.reviewTitle}
                    onChange={(event) => setForm({ ...form, reviewTitle: event.target.value })}
                    className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-white"
                    placeholder="Short summary"
                    maxLength={255}
                  />
                </label>

                <label className="block text-sm font-medium text-secondary-300">
                  Review
                  <textarea
                    value={form.reviewText}
                    onChange={(event) => setForm({ ...form, reviewText: event.target.value })}
                    className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-white"
                    placeholder="Write the review"
                    rows={5}
                    required
                  />
                </label>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1" disabled={saving || products.length === 0}>
                    {saving ? 'Saving...' : 'Post Review'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
