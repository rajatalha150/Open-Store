'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { GripVertical, Plus, Edit, Trash2, X } from 'lucide-react'
import { getUploadErrorMessage, uploadImageFile } from '@/lib/upload-client'
import { isValidProductImageUrl, MAX_PRODUCT_IMAGES } from '@/lib/product-images'
import { MAX_PRODUCT_VARIANTS } from '@/lib/product-variants'
import type { ProductVariant } from '@/lib/product-variants'

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  category_id: string;
  image_url?: string;
  images?: string[];
  variants?: ProductVariant[];
  in_stock: boolean;
  category_name?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [productImages, setProductImages] = useState<string[]>([])
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([])
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (editingProduct) {
      if (editingProduct.images && Array.isArray(editingProduct.images) && editingProduct.images.length > 0) {
        setProductImages(editingProduct.images)
      } else if (editingProduct.image_url) {
        setProductImages([editingProduct.image_url])
      } else {
        setProductImages([])
      }
    } else {
      setProductImages([])
    }
    setProductVariants(normalizeEditableVariants(editingProduct?.variants || []))
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }, [editingProduct])

  function normalizeEditableVariants(variants: ProductVariant[]) {
    return variants
      .filter((variant) => variant.name && variant.value)
      .slice(0, MAX_PRODUCT_VARIANTS)
      .map((variant, index) => ({
        id: variant.id || index + 1,
        name: variant.name,
        value: variant.value,
        price_modifier: Number(variant.price_modifier || 0),
        stock_quantity: Math.max(0, Number(variant.stock_quantity || 0)),
      }))
  }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = MAX_PRODUCT_IMAGES - productImages.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      setError(`Only ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} can be added.`)
    }

    setUploading(true)
    if (files.length <= remainingSlots) {
      setError('')
    }

    try {
      for (const file of filesToUpload) {
        const url = await uploadImageFile(file, 'products')
        setProductImages(prev => [...prev, url])
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      setError(getUploadErrorMessage(error, 'Upload failed.'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleAddImageUrl = () => {
    const trimmedUrl = imageUrl.trim()
    if (!trimmedUrl) return

    if (productImages.length >= MAX_PRODUCT_IMAGES) {
      setError(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`)
      return
    }

    if (!isValidProductImageUrl(trimmedUrl)) {
      setError('Enter a valid image URL before adding it.')
      return
    }

    if (productImages.includes(trimmedUrl)) {
      setError('That image has already been added.')
      return
    }

    setError('')
    setProductImages(prev => [...prev, trimmedUrl])
    setImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index))
  }

  const reorderProductImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setProductImages((prev) => {
      const nextImages = [...prev]
      const [movedImage] = nextImages.splice(fromIndex, 1)
      nextImages.splice(toIndex, 0, movedImage)
      return nextImages
    })
  }

  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index)
    setDragOverImageIndex(index)
  }

  const handleImageDragEnter = (index: number) => {
    if (draggedImageIndex === null || draggedImageIndex === index) return
    setDragOverImageIndex(index)
  }

  const handleImageDrop = (index: number) => {
    if (draggedImageIndex === null) return

    reorderProductImages(draggedImageIndex, index)
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null)
    setDragOverImageIndex(null)
  }

  const handleMakePrimary = (index: number) => {
    reorderProductImages(index, 0)
  }

  const handleAddVariant = () => {
    if (productVariants.length >= MAX_PRODUCT_VARIANTS) {
      setError(`Maximum ${MAX_PRODUCT_VARIANTS} variants allowed`)
      return
    }

    setError('')
    setProductVariants(prev => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        value: '',
        price_modifier: 0,
        stock_quantity: editingProduct?.stock_quantity ?? 0,
      },
    ])
  }

  const handleVariantChange = (
    index: number,
    field: 'name' | 'value' | 'price_modifier' | 'stock_quantity',
    value: string
  ) => {
    setProductVariants(prev => prev.map((variant, variantIndex) => {
      if (variantIndex !== index) return variant

      if (field === 'price_modifier') {
        const parsedValue = Number(value)
        return { ...variant, price_modifier: value === '' || !Number.isFinite(parsedValue) ? 0 : parsedValue }
      }

      if (field === 'stock_quantity') {
        const parsedValue = Number(value)
        return { ...variant, stock_quantity: value === '' || !Number.isFinite(parsedValue) ? 0 : Math.max(0, parsedValue) }
      }

      return { ...variant, [field]: value }
    }))
  }

  const handleRemoveVariant = (index: number) => {
    setProductVariants(prev => prev.filter((_, variantIndex) => variantIndex !== index))
  }

  const getCleanProductVariants = () => {
    const variantsWithAnyData = productVariants.filter((variant) =>
      variant.name.trim() ||
      variant.value.trim() ||
      Number(variant.price_modifier) !== 0 ||
      Number(variant.stock_quantity) !== 0
    )

    const hasIncompleteVariant = variantsWithAnyData.some((variant) =>
      !variant.name.trim() || !variant.value.trim()
    )

    if (hasIncompleteVariant) {
      return { success: false as const, error: 'Each variant needs both an option name and option value.' }
    }

    return {
      success: true as const,
      variants: variantsWithAnyData.slice(0, MAX_PRODUCT_VARIANTS).map((variant, index) => ({
        id: variant.id || index + 1,
        name: variant.name.trim(),
        value: variant.value.trim(),
        price_modifier: Number(variant.price_modifier || 0),
        stock_quantity: Math.max(0, Math.floor(Number(variant.stock_quantity || 0))),
      })),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const variantsResult = getCleanProductVariants()

    if (!variantsResult.success) {
      setError(variantsResult.error)
      setSaving(false)
      return
    }

    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
      stock_quantity: parseInt(formData.get('stock_quantity') as string || '100'),
      category_id: formData.get('category_id') as string, // Keep as string for Firestore
      image_url: productImages.length > 0 ? productImages[0] : (imageUrl || formData.get('image_url')),
      images: productImages,
      variants: variantsResult.variants,
      in_stock: formData.get('in_stock') === 'on'
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct ? { ...productData, id: editingProduct.id } : productData

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        setShowModal(false)
        setEditingProduct(null)
        setImageUrl('')
        setError('')
        fetchProducts()
      } else {
        setError(data.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Failed to save product:', error)
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchProducts()
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <button
            onClick={() => { setEditingProduct(null); setShowModal(true) }}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-secondary-800">
            <thead className="bg-secondary-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-800">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-secondary-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded object-cover" src={product.image_url} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{product.name}</div>
                        <div className="text-sm text-secondary-400">{product.description?.substring(0, 50)}...</div>
                        {product.variants?.length > 0 && (
                          <div className="text-xs text-primary-300 mt-1">{product.variants.length} variant{product.variants.length === 1 ? '' : 's'}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{product.category_name}</td>
                  <td className="px-6 py-4 text-sm text-white">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${product.in_stock ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => { setEditingProduct(product); setShowModal(true) }}
                      className="text-primary-400 hover:text-primary-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-secondary-900 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-secondary-100 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  placeholder="Product Name"
                  defaultValue={editingProduct?.name || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  defaultValue={editingProduct?.description || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  rows={3}
                />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  defaultValue={editingProduct?.price || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  required
                />
                <input
                  name="original_price"
                  type="number"
                  step="0.01"
                  placeholder="Original Price (optional)"
                  defaultValue={editingProduct?.original_price || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                />
                <input
                  name="stock_quantity"
                  type="number"
                  placeholder="Stock Quantity"
                  defaultValue={editingProduct?.stock_quantity ?? 100}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                />
                <select
                  name="category_id"
                  defaultValue={editingProduct?.category_id || ''}
                  className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="space-y-2">
                  <label className="block text-sm text-secondary-300">
                    Product Images ({productImages.length}/{MAX_PRODUCT_IMAGES})
                  </label>

                  {/* Image List */}
                  {productImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {productImages.map((img, index) => (
                        <div
                          key={`${img}-${index}`}
                          draggable
                          onDragStart={() => handleImageDragStart(index)}
                          onDragEnter={() => handleImageDragEnter(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleImageDrop(index)}
                          onDragEnd={handleImageDragEnd}
                          className={`relative group w-24 rounded-lg border transition-all ${
                            dragOverImageIndex === index
                              ? 'border-primary-500 ring-2 ring-primary-500/40'
                              : 'border-secondary-700'
                          } ${
                            draggedImageIndex === index ? 'opacity-60' : 'opacity-100'
                          }`}
                        >
                          <div className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                            <GripVertical className="h-3 w-3 text-secondary-300" />
                            <span>{index === 0 ? 'Primary' : `Image ${index + 1}`}</span>
                          </div>
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg"
                          />
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(index)}
                              className="absolute bottom-1.5 left-1.5 rounded bg-secondary-950/90 px-2 py-1 text-[10px] font-medium text-secondary-100 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {productImages.length < MAX_PRODUCT_IMAGES && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="flex-1 p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100 text-sm"
                        />
                        {uploading && <span className="text-primary-400 text-sm flex items-center">Uploading...</span>}
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input
                            name="image_input"
                            placeholder="Paste image URL..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full p-2 border border-secondary-700 rounded bg-secondary-800 text-secondary-100 placeholder-secondary-500"
                          />
                          {imageUrl && (
                            <div className="mt-2 bg-secondary-950 rounded p-2 border border-secondary-800 inline-block">
                              <span className="text-xs text-secondary-400 block mb-1">Preview:</span>
                              <img
                                src={imageUrl}
                                alt="Preview"
                                className="h-24 w-auto max-w-full object-contain rounded"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          disabled={!imageUrl.trim()}
                          className="bg-secondary-700 px-4 py-2 rounded hover:bg-secondary-600 disabled:opacity-50 text-white h-[42px]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-secondary-500">
                    Drag thumbnails to reorder them. The first image is used as the primary storefront image.
                  </p>
                </div>
                <div className="space-y-3 rounded-lg border border-secondary-800 bg-secondary-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-200">
                        Product Variants ({productVariants.length}/{MAX_PRODUCT_VARIANTS})
                      </label>
                      <p className="mt-1 text-xs text-secondary-500">
                        Add options like Size: Large or Color: Black. Customers must choose one value from each option group.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={productVariants.length >= MAX_PRODUCT_VARIANTS}
                      className="shrink-0 rounded bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add Variant
                    </button>
                  </div>

                  {productVariants.length === 0 ? (
                    <p className="rounded border border-dashed border-secondary-800 p-3 text-sm text-secondary-500">
                      No variants yet. Leave this empty for a single-option product.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {productVariants.map((variant, index) => (
                        <div key={variant.id || index} className="grid grid-cols-1 gap-2 rounded border border-secondary-800 bg-secondary-900 p-3 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] md:items-end">
                          <label className="text-xs text-secondary-400">
                            Option Name
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                              placeholder="Size"
                              className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-sm text-secondary-100 placeholder-secondary-500"
                            />
                          </label>
                          <label className="text-xs text-secondary-400">
                            Option Value
                            <input
                              type="text"
                              value={variant.value}
                              onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                              placeholder="Large"
                              className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-sm text-secondary-100 placeholder-secondary-500"
                            />
                          </label>
                          <label className="text-xs text-secondary-400">
                            Price Adjustment
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price_modifier}
                              onChange={(e) => handleVariantChange(index, 'price_modifier', e.target.value)}
                              placeholder="0.00"
                              className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-sm text-secondary-100 placeholder-secondary-500"
                            />
                          </label>
                          <label className="text-xs text-secondary-400">
                            Variant Stock
                            <input
                              type="number"
                              min="0"
                              value={variant.stock_quantity}
                              onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)}
                              placeholder="0"
                              className="mt-1 w-full rounded border border-secondary-700 bg-secondary-800 p-2 text-sm text-secondary-100 placeholder-secondary-500"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="rounded bg-red-500/20 px-3 py-2 text-sm text-red-200 hover:bg-red-500/30"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex items-center">
                  <input
                    name="in_stock"
                    type="checkbox"
                    defaultChecked={editingProduct?.in_stock !== false}
                    className="mr-2"
                  />
                  In Stock
                </label>
                <div className="flex space-x-2">
                  <button type="submit" className="btn-primary flex-1" disabled={saving}>
                    {saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingProduct(null); setImageUrl('') }}
                    className="btn-secondary flex-1"
                  >
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
