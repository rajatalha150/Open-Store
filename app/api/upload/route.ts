import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({
        error: 'Blob storage is not configured for this project.',
        code: 'blob_token_missing',
        hint: 'Create or link a Vercel Blob store in Storage, confirm BLOB_READ_WRITE_TOKEN is added to the project, then redeploy.'
      }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const rawFolder = (formData.get('folder') as string) || 'products';
    const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${folder || 'products'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const blob = await put(filename, file, {
      access: 'public',
      token,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Upload handler error:', error);

    const message = error?.message || String(error);
    const name = error?.name || 'UploadError';

    if (name === 'BlobStoreNotFoundError' || message.includes('This store does not exist')) {
      return NextResponse.json({
        error: 'Blob storage is linked to a store that no longer exists.',
        code: 'blob_store_missing',
        hint: 'Open Vercel Dashboard -> Storage -> Blob, create or link a store to this project, make sure BLOB_READ_WRITE_TOKEN is refreshed, then redeploy.',
        details: message,
      }, { status: 503 });
    }

    if (message.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json({
        error: 'Blob storage token is invalid or missing.',
        code: 'blob_token_invalid',
        hint: 'Reconnect the Blob store in Vercel so the project gets a fresh BLOB_READ_WRITE_TOKEN, then redeploy.',
        details: message,
      }, { status: 503 });
    }

    return NextResponse.json({
      error: 'Upload failed',
      code: 'upload_failed',
      details: message
    }, { status: 500 });
  }
}
