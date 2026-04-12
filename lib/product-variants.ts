import { isValidProductImageUrl } from '@/lib/product-images';

export const MAX_PRODUCT_VARIANTS = 10;

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  price_modifier: number;
  stock_quantity: number;
  image_url?: string;
}

function toFiniteNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toNonNegativeInteger(value: unknown, fallback = 0) {
  return Math.max(0, Math.floor(toFiniteNumber(value, fallback)));
}

function parseVariantInput(variants: unknown) {
  if (Array.isArray(variants)) {
    return variants;
  }

  if (typeof variants === 'string' && variants.trim()) {
    try {
      const parsed = JSON.parse(variants);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function normalizeProductVariants(variants: unknown): ProductVariant[] {
  const normalizedVariants: ProductVariant[] = [];
  const seenVariants = new Set<string>();

  const rawVariants = parseVariantInput(variants);

  for (let index = 0; index < rawVariants.length; index += 1) {
    const rawVariant = rawVariants[index];
    if (!rawVariant || typeof rawVariant !== 'object') {
      continue;
    }

    const variant = rawVariant as Record<string, unknown>;
    const name = typeof variant.name === 'string' ? variant.name.trim() : '';
    const value = typeof variant.value === 'string' ? variant.value.trim() : '';
    const imageUrl = typeof variant.image_url === 'string' ? variant.image_url.trim() : '';

    if (!name || !value) {
      continue;
    }

    const variantKey = `${name.toLowerCase()}::${value.toLowerCase()}`;
    if (seenVariants.has(variantKey)) {
      continue;
    }

    seenVariants.add(variantKey);
    normalizedVariants.push({
      id: toNonNegativeInteger(variant.id, index + 1) || index + 1,
      name,
      value,
      price_modifier: toFiniteNumber(variant.price_modifier, 0),
      stock_quantity: toNonNegativeInteger(variant.stock_quantity, 0),
      ...(imageUrl && isValidProductImageUrl(imageUrl) ? { image_url: imageUrl } : {}),
    });

    if (normalizedVariants.length >= MAX_PRODUCT_VARIANTS) {
      break;
    }
  }

  return normalizedVariants;
}

export function getVariantSelectionLabel(variants: ProductVariant[]) {
  return variants.map((variant) => `${variant.name}: ${variant.value}`).join(', ');
}

export function getVariantSelectionKey(variants: ProductVariant[]) {
  return variants
    .map((variant) => `${variant.name.trim().toLowerCase()}=${variant.value.trim().toLowerCase()}`)
    .sort()
    .join('|');
}
