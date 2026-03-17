import { NextRequest } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth';
import { ensureDatabaseInitialized } from '@/lib/db-init';

const defaultSeoSettings = {
  siteTitle: '',
  siteDescription: 'Online Store',
  keywords: 'ecommerce, daily essentials, online store',
  ogImage: '',
  twitterCard: 'summary_large_image',
  googleAnalytics: '',
  googleSearchConsole: '',
  robotsTxt: 'User-agent: *\nAllow: /',
  enableSitemap: true,
  lastGeneratedAt: '',
};

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const result = await getSettings('seo');
    if (!result.success) {
      return createErrorResponse('Failed to load SEO settings');
    }

    return createAdminResponse({
      settings: {
        ...defaultSeoSettings,
        ...(result.settings || {}),
        enableSitemap: (result.settings?.enableSitemap ?? true) !== false,
      },
    });
  } catch (error) {
    console.error('Failed to load SEO settings:', error);
    return createErrorResponse('Failed to load SEO settings');
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const body = await request.json();
    const toSave = {
      ...defaultSeoSettings,
      ...body,
      enableSitemap: body.enableSitemap !== false,
      lastGeneratedAt: body.lastGeneratedAt || '',
    };

    const result = await updateSettings('seo', toSave);
    if (!result.success) {
      return createErrorResponse('Failed to save SEO settings');
    }

    return createAdminResponse({ success: true, settings: toSave });
  } catch (error) {
    console.error('Failed to save SEO settings:', error);
    return createErrorResponse('Failed to save SEO settings');
  }
}
