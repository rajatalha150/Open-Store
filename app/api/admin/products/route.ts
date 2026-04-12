import { NextRequest } from 'next/server'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/db'
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth'
import { ensureDatabaseInitialized } from '@/lib/db-init'
import { z } from 'zod'
import { isValidProductImageUrl, MAX_PRODUCT_IMAGES, normalizeProductImages } from '@/lib/product-images'
import { MAX_PRODUCT_VARIANTS, normalizeProductVariants } from '@/lib/product-variants'

const imageUrlSchema = z.string().trim().min(1).max(500).refine(isValidProductImageUrl, {
  message: 'Each image must be a valid URL or root-relative path',
})

const optionalPositiveNumberSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  if (typeof value === 'string') {
    const parsedNumber = Number(value)
    return Number.isFinite(parsedNumber) ? parsedNumber : value
  }

  return value
}, z.number().positive().nullable())

const variantPayloadSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1).max(50),
  value: z.string().trim().min(1).max(80),
  price_modifier: z.coerce.number().min(-999999).max(999999).default(0),
  stock_quantity: z.coerce.number().int().min(0).default(0),
})

const productPayloadSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  price: z.coerce.number().positive(),
  original_price: optionalPositiveNumberSchema.optional(),
  stock_quantity: z.coerce.number().int().min(0),
  category_id: z.coerce.number().int().positive(),
  image_url: imageUrlSchema.nullable().optional(),
  images: z.array(imageUrlSchema).max(MAX_PRODUCT_IMAGES).optional(),
  variants: z.array(variantPayloadSchema).max(MAX_PRODUCT_VARIANTS).optional(),
  in_stock: z.boolean().optional(),
  sku: z.string().max(100).optional().nullable(),
  weight: optionalPositiveNumberSchema.optional(),
  dimensions: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  featured: z.boolean().optional(),
})

function buildProductPayload(body: unknown) {
  const parsed = productPayloadSchema.safeParse(body)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return {
      success: false as const,
      error: firstIssue?.message || 'Invalid product data',
    }
  }

  const product = parsed.data
  const normalizedImages = normalizeProductImages(product.images, product.image_url)
  const normalizedVariants = normalizeProductVariants(product.variants)

  return {
    success: true as const,
    data: {
      ...product,
      image_url: normalizedImages[0] || product.image_url || null,
      images: normalizedImages,
      variants: normalizedVariants,
      in_stock: product.in_stock ?? true,
      description: product.description || null,
      sku: product.sku || null,
      weight: product.weight ?? null,
      dimensions: product.dimensions || null,
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')
    await ensureDatabaseInitialized()
    const result = await getProducts(categoryId || undefined, limit)

    if (result.success) {
      return createAdminResponse({ products: result.products })
    } else {
      return createErrorResponse('Failed to fetch products')
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return createErrorResponse('Internal server error')
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json()
    const payload = buildProductPayload(body)

    if (!payload.success) {
      return createErrorResponse(payload.error, 400)
    }

    const result = await createProduct(payload.data)

    if (result.success) {
      return createAdminResponse({ product: result.product }, 201)
    } else {
      return createErrorResponse(result.error?.toString() || 'Failed to create product', 500)
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return createErrorResponse('Error creating product', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json()
    const payload = buildProductPayload(body)

    if (!payload.success) {
      return createErrorResponse(payload.error, 400)
    }

    const { id, ...productData } = payload.data

    if (!id) {
      return createErrorResponse('Product ID required', 400)
    }

    const result = await updateProduct(id, productData)

    if (result.success) {
      return createAdminResponse({ product: result.product })
    } else {
      return createErrorResponse('Failed to update product')
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return createErrorResponse('Invalid request body', 400)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createErrorResponse('Product ID required', 400)
    }

    const result = await deleteProduct(id)

    if (result.success) {
      return createAdminResponse({ message: 'Product deleted successfully' })
    } else {
      return createErrorResponse('Failed to delete product')
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return createErrorResponse('Invalid request', 400)
  }
}
