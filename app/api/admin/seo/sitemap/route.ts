import { NextRequest } from 'next/server';
import { sql } from '@/lib/db-pool';
import { getSettings, updateSettings } from '@/lib/db';
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth';
import { ensureDatabaseInitialized } from '@/lib/db-init';

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;

    const [products, categories] = await Promise.all([
      sql`SELECT id FROM products ORDER BY id`,
      sql`SELECT slug FROM categories ORDER BY slug`,
    ]);

    const urls = [
      `${origin}/`,
      `${origin}/categories`,
      `${origin}/bestsellers`,
      `${origin}/new`,
      `${origin}/deals`,
      `${origin}/about`,
      `${origin}/contact`,
      `${origin}/faq`,
      `${origin}/privacy`,
      `${origin}/terms`,
      ...categories.map((category: Record<string, any>) => `${origin}/category/${category.slug}`),
      ...products.map((product: Record<string, any>) => `${origin}/product/${product.id}`),
    ];

    const uniqueUrls = Array.from(new Set(urls));
    const generatedAt = new Date().toISOString();

    const seoResult = await getSettings('seo');
    const existingSeoSettings = seoResult.success ? (seoResult.settings || {}) : {};

    await updateSettings('seo', {
      ...existingSeoSettings,
      lastGeneratedAt: generatedAt,
      lastGeneratedUrlCount: uniqueUrls.length,
    });

    return createAdminResponse({
      success: true,
      generatedAt,
      urlCount: uniqueUrls.length,
      urls: uniqueUrls,
    });
  } catch (error) {
    console.error('Failed to generate sitemap data:', error);
    return createErrorResponse('Failed to generate sitemap');
  }
}
