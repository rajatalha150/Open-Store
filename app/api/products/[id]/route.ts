import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/db'
import { normalizeProductImages } from '@/lib/product-images'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const result = await getProductById(id);

    if (!result.success || !result.product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const product = result.product as any;

    const normalizedImages = normalizeProductImages(product.images, product.image_url)
    product.images = normalizedImages.map((url: string, index: number) => ({
      id: index,
      image_url: url,
      alt_text: `${product.name} - Image ${index + 1}`
    }));

    if (!product.variants || !Array.isArray(product.variants)) {
      product.variants = [];
    }

    // Cast IDs to numbers if needed by frontend (or keep strings)
    // The frontend interface expects numbers for IDs.
    // We might need to keep them as is and hope frontend handles coercion or update frontend.
    // For now, let's return what we have.

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
