type UploadErrorPayload = {
  error?: string;
  hint?: string;
  details?: string;
  code?: string;
};

export async function uploadImageFile(file: File, folder = 'products') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as UploadErrorPayload & { url?: string };

  if (!response.ok || !payload.url) {
    const message = formatUploadErrorPayload(payload);
    const error = new Error(message) as Error & { code?: string; details?: string; status?: number };
    error.code = payload.code;
    error.details = payload.details;
    error.status = response.status;
    throw error;
  }

  return payload.url;
}

export function getUploadErrorMessage(error: unknown, fallback = 'Upload failed.') {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function formatUploadErrorPayload(payload: UploadErrorPayload) {
  const parts = [payload.error, payload.hint].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }
  return 'Upload failed.';
}
