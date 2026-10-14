import { StoreProfile } from '../types';
import { DEFAULT_STORES } from '../data/defaultStores';

const STORAGE_KEY = 'quickmenu_stores_v1';
const ACTIVE_STORE_KEY = 'quickmenu_active_slug';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getAllStores(): StoreProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
      return DEFAULT_STORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_STORES;
  } catch (err) {
    console.error('Error reading stores from localStorage:', err);
    return DEFAULT_STORES;
  }
}

export function saveStores(stores: StoreProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
  } catch (err) {
    console.error('Error saving stores to localStorage:', err);
  }
}

export function getStoreBySlug(slug: string): StoreProfile | null {
  const stores = getAllStores();
  return stores.find((s) => s.slug === slug || s.id === slug) || null;
}

export function saveOrUpdateStore(store: StoreProfile): void {
  const stores = getAllStores();
  const index = stores.findIndex((s) => s.id === store.id || s.slug === store.slug);
  if (index >= 0) {
    stores[index] = { ...store, updatedAt: new Date().toISOString() };
  } else {
    stores.unshift({ ...store, updatedAt: new Date().toISOString() });
  }
  saveStores(stores);
  localStorage.setItem(ACTIVE_STORE_KEY, store.slug);
}

export function getActiveStoreSlug(): string {
  const saved = localStorage.getItem(ACTIVE_STORE_KEY);
  if (saved) return saved;
  const stores = getAllStores();
  return stores[0]?.slug || 'hyderabad-bakes';
}

export function setActiveStoreSlug(slug: string): void {
  localStorage.setItem(ACTIVE_STORE_KEY, slug);
}

/**
 * Encodes store into a base64 string for portable URL sharing across devices
 */
export function encodeStoreForUrl(store: StoreProfile): string {
  try {
    const json = JSON.stringify(store);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  } catch {
    return '';
  }
}

/**
 * Decodes store from base64 string
 */
export function decodeStoreFromUrl(encoded: string): StoreProfile | null {
  try {
    const decoded = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.businessName && Array.isArray(parsed.items)) {
      return parsed as StoreProfile;
    }
    return null;
  } catch {
    return null;
  }
}
