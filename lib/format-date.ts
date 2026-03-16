export function parseDate(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string | Date | null, fallback = 'N/A') {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value?: string | Date | null, fallback = 'N/A') {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value?: string | Date | null, fallback = 'N/A') {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleTimeString('en-US');
}
