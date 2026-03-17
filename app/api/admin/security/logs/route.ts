import { NextRequest } from 'next/server';
import { sql } from '@/lib/db-pool';
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const filter = request.nextUrl.searchParams.get('filter') || 'all';
    const page = Math.max(parseInt(request.nextUrl.searchParams.get('page') || '1', 10), 1);
    const limit = Math.max(parseInt(request.nextUrl.searchParams.get('limit') || '50', 10), 1);
    const offset = (page - 1) * limit;

    let rows: Record<string, any>[] = [];
    let countRows: Record<string, any>[] = [];

    if (filter !== 'all') {
      rows = await sql`
        SELECT
          sl.id,
          sl.event_type,
          COALESCE(u.email, 'System') AS user_email,
          COALESCE(sl.ip_address, '') AS ip_address,
          COALESCE(sl.user_agent, '') AS user_agent,
          COALESCE(sl.description, '') AS details,
          sl.created_at AS timestamp
        FROM security_logs sl
        LEFT JOIN users u ON u.id = sl.user_id
        WHERE sl.event_type = ${filter}
        ORDER BY sl.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM security_logs
        WHERE event_type = ${filter}
      `;
    } else {
      rows = await sql`
        SELECT
          sl.id,
          sl.event_type,
          COALESCE(u.email, 'System') AS user_email,
          COALESCE(sl.ip_address, '') AS ip_address,
          COALESCE(sl.user_agent, '') AS user_agent,
          COALESCE(sl.description, '') AS details,
          sl.created_at AS timestamp
        FROM security_logs sl
        LEFT JOIN users u ON u.id = sl.user_id
        ORDER BY sl.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countRows = await sql`SELECT COUNT(*)::int AS total FROM security_logs`;
    }

    const totalCount = countRows[0]?.total || 0;
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    return createAdminResponse({
      logs: rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    if (error?.code === '42P01') {
      return createAdminResponse({
        logs: [],
        pagination: { page: 1, limit: 50, totalCount: 0, totalPages: 1 },
      });
    }

    console.error('Failed to fetch security logs:', error);
    return createErrorResponse('Failed to fetch security logs');
  }
}
