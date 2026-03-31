export const MAX_PRODUCT_IMAGES = 10;

export function isValidProductImageUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  if (trimmedValue.startsWith('/')) {
    return true;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeProductImages(images: unknown, fallbackImageUrl?: string | null) {
  const normalized = Array.isArray(images)
    ? images
    : typeof images === 'string' && images.trim()
      ? [images]
      : [];

  const uniqueImages: string[] = [];
  const seenImages = new Set<string>();

  for (const image of normalized) {
    if (typeof image !== 'string') {
      continue;
    }

    const trimmedImage = image.trim();
    if (!trimmedImage || seenImages.has(trimmedImage)) {
      continue;
    }

    seenImages.add(trimmedImage);
    uniqueImages.push(trimmedImage);
  }

  const trimmedFallbackImage = fallbackImageUrl?.trim();
  if (uniqueImages.length === 0 && trimmedFallbackImage) {
    uniqueImages.push(trimmedFallbackImage);
  }

  return uniqueImages.slice(0, MAX_PRODUCT_IMAGES);
}

export function getPrimaryProductImage(images: string[], fallbackImageUrl?: string | null) {
  return images[0] || fallbackImageUrl?.trim() || null;
}
