import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminResponse, createErrorResponse, validateAdminAccess } from '@/lib/admin-auth';
import { createProductReview, deleteProductReview, updateReviewStatus } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db-init';
import { sql } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const reviewStatusSchema = z.enum(['pending', 'approved', 'rejected']);

const adminReviewPayloadSchema = z.object({
  productId: z.coerce.number().int().positive(),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().max(100).optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5),
  reviewTitle: z.string().trim().max(255).optional().nullable(),
  reviewText: z.string().trim().min(1, 'Review is required').max(5000),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function buildReviewDate(reviewDate?: string) {
  const dateString = reviewDate || getTodayDateString();
  const date = new Date(`${dateString}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateString) {
    return {
      success: false as const,
      error: 'Review date is invalid',
    };
  }

  if (dateString > getTodayDateString()) {
    return {
      success: false as const,
      error: 'Review date cannot be in the future',
    };
  }

  return {
    success: true as const,
    date,
  };
}

async function requireAdmin(request: NextRequest) {
  const authResult = await validateAdminAccess(request);

  if (!authResult.authorized) {
    return {
      success: false as const,
      response: createErrorResponse(authResult.error!, authResult.status),
    };
  }

  return { success: true as const };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return authResult.response;
    }

    await ensureDatabaseInitialized();
    const reviews = await sql`
      SELECT r.*, p.name as product_name
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `;

    return createAdminResponse({ reviews });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return createErrorResponse('Failed to fetch reviews');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return authResult.response;
    }

    await ensureDatabaseInitialized();
    const body = await request.json();
    const parsed = adminReviewPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return createErrorResponse(parsed.error.issues[0]?.message || 'Invalid review data', 400);
    }

    const reviewDate = buildReviewDate(parsed.data.reviewDate);
    if (!reviewDate.success) {
      return createErrorResponse(reviewDate.error, 400);
    }

    const productRows = await sql`
      SELECT id
      FROM products
      WHERE id = ${parsed.data.productId}
      LIMIT 1
    `;

    if (productRows.length === 0) {
      return createErrorResponse('Selected product was not found', 404);
    }

    const customerName = [parsed.data.firstName, parsed.data.lastName || '']
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' ');

    const result = await createProductReview({
      product_id: parsed.data.productId,
      order_id: null,
      user_id: null,
      customer_name: customerName,
      customer_email: null,
      rating: parsed.data.rating,
      review_title: parsed.data.reviewTitle || '',
      review_text: parsed.data.reviewText,
      verified_purchase: false,
      status: 'approved',
      created_at: reviewDate.date,
    });

    if (!result.success) {
      return createErrorResponse('Failed to create review');
    }

    return createAdminResponse({ review: result.review }, 201);
  } catch (error) {
    console.error('Error creating admin review:', error);
    return createErrorResponse('Failed to create review', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return authResult.response;
    }

    await ensureDatabaseInitialized();
    const body = await request.json();
    const id = z.coerce.number().int().positive().safeParse(body.id);
    const status = reviewStatusSchema.safeParse(body.status);

    if (!id.success) {
      return createErrorResponse('Review ID is required', 400);
    }

    if (!status.success) {
      return createErrorResponse('Invalid status. Must be pending, approved, or rejected', 400);
    }

    const result = await updateReviewStatus(id.data, status.data);

    if (result.success) {
      return createAdminResponse({
        success: true,
        review: result.review,
      });
    }

    const errorMessage = result.error?.toString() || 'Failed to update review status';
    return createErrorResponse(errorMessage, errorMessage === 'Review not found' ? 404 : 500);
  } catch (error) {
    console.error('Error updating review status:', error);
    return createErrorResponse('Failed to update review status', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return authResult.response;
    }

    await ensureDatabaseInitialized();
    const { searchParams } = new URL(request.url);
    const id = z.coerce.number().int().positive().safeParse(searchParams.get('id'));

    if (!id.success) {
      return createErrorResponse('Review ID is required', 400);
    }

    const result = await deleteProductReview(id.data);

    if (!result.success) {
      const errorMessage = result.error?.toString() || 'Failed to delete review';
      return createErrorResponse(errorMessage, errorMessage === 'Review not found' ? 404 : 500);
    }

    return createAdminResponse({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return createErrorResponse('Failed to delete review', 500);
  }
}
