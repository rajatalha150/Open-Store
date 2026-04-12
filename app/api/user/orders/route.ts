import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db-pool'

let ensureOrderItemVariantDetailsColumnPromise: Promise<void> | null = null;

async function ensureOrderItemVariantDetailsColumn() {
  if (!ensureOrderItemVariantDetailsColumnPromise) {
    ensureOrderItemVariantDetailsColumnPromise = sql`
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_details JSONB
    `.then(() => undefined).catch((error) => {
      ensureOrderItemVariantDetailsColumnPromise = null;
      throw error;
    });
  }

  await ensureOrderItemVariantDetailsColumnPromise;
}

function formatProductNameWithVariant(productName: string, variantDetails: any) {
  return variantDetails?.label ? `${productName} (${variantDetails.label})` : productName;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id);
    await ensureOrderItemVariantDetailsColumn();

    const rows = await sql`
      SELECT o.*, json_agg(json_build_object('product_name', p.name, 'variant_details', oi.variant_details, 'quantity', oi.quantity, 'price', oi.price, 'image_url', COALESCE(p.image_url, '/placeholder.svg'))) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ${userId}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const orders = rows.map((row: any) => ({
      id: row.id,
      order_number: row.order_number,
      total_amount: parseFloat(row.total_amount || 0),
      status: row.status,
      created_at: row.created_at,
      item_count: row.items?.[0]?.product_name ? row.items.length : 0,
      items: row.items?.[0]?.product_name
        ? row.items.map((item: any) => ({
          ...item,
          product_name: formatProductNameWithVariant(item.product_name, item.variant_details),
        }))
        : []
    }));

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('User orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
