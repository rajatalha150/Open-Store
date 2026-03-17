import { NextRequest } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const result = await getSettings();
    if (!result.success) {
      return createErrorResponse('Failed to load security settings');
    }

    const settings = result.settings || {};

    return createAdminResponse({
      enableLoginLogging: (settings.security_enable_login_logging || 'true') === 'true',
      enableFailedLoginAlerts: (settings.security_enable_failed_login_alerts || 'true') === 'true',
      maxFailedAttempts: parseInt(settings.security_max_failed_attempts || '5', 10),
      lockoutDuration: parseInt(settings.security_lockout_duration || '30', 10),
      enableIPBlocking: (settings.security_enable_ip_blocking || 'true') === 'true',
    });
  } catch (error) {
    console.error('Failed to load security settings:', error);
    return createErrorResponse('Failed to load security settings');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const body = await request.json();
    const toSave: Record<string, string> = {
      security_enable_login_logging: String(!!body.enableLoginLogging),
      security_enable_failed_login_alerts: String(!!body.enableFailedLoginAlerts),
      security_max_failed_attempts: String(body.maxFailedAttempts ?? 5),
      security_lockout_duration: String(body.lockoutDuration ?? 30),
      security_enable_ip_blocking: String(!!body.enableIPBlocking),
    };

    const result = await updateSettings('general', toSave);
    if (!result.success) {
      return createErrorResponse('Failed to update security settings');
    }

    return createAdminResponse({ success: true });
  } catch (error) {
    console.error('Failed to update security settings:', error);
    return createErrorResponse('Invalid request body', 400);
  }
}
