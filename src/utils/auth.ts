import { MerchantUser, StoreProfile, BusinessType } from '../types';
import { slugify } from './storage';
import { DEFAULT_STORES } from '../data/defaultStores';

const USER_STORAGE_KEY = 'quickmenu_user_session';
const ALL_USERS_KEY = 'quickmenu_registered_users';

export function getCurrentUser(): MerchantUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAllUsers(): MerchantUser[] {
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function registerUser(name: string, email: string, phone: string): MerchantUser {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  // Check if existing user with email or phone
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone);

  if (!user) {
    user = {
      id: `merchant-${Date.now()}`,
      name: name.trim() || 'Business Owner',
      email: cleanEmail,
      phone: cleanPhone,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function loginUser(emailOrPhone: string): MerchantUser | null {
  const users = getAllUsers();
  const query = emailOrPhone.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === query ||
      u.phone.replace(/\D/g, '') === query.replace(/\D/g, '') ||
      u.phone.includes(query)
  );

  if (found) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(found));
    return found;
  }

  // If first time logging in with new details, auto-create account for seamless zero-barrier onboarding
  const newUser: MerchantUser = {
    id: `merchant-${Date.now()}`,
    name: query.includes('@') ? query.split('@')[0] : 'Merchant',
    email: query.includes('@') ? query : `${query.replace(/\D/g, '')}@merchant.quickmenu.in`,
    phone: query.includes('@') ? '+91 98765 43210' : query,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

export function logoutUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getStoresForUser(user: MerchantUser, allStores: StoreProfile[]): StoreProfile[] {
  const userStores = allStores.filter((s) => s.ownerId === user.id);
  if (userStores.length > 0) {
    return userStores;
  }

  // If no store linked to this user yet, create their default primary store
  const newStore: StoreProfile = {
    id: `store-${user.id}`,
    slug: slugify(user.name) || `store-${Date.now().toString().slice(-4)}`,
    ownerId: user.id,
    businessType: 'food',
    businessName: user.name.endsWith('Bakes') || user.name.endsWith('Kitchen') ? user.name : `${user.name}'s Kitchen`,
    whatsappNumber: user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone.replace(/\D/g, '')}`,
    currency: '₹',
    tagline: 'Freshly prepared delicacies delivered to your doorstep',
    city: 'India',
    deliveryNote: 'Delivering fresh across the city • Direct WhatsApp orders',
    items: [...DEFAULT_STORES[0].items], // Preload with sample items so they aren't staring at an empty page
    updatedAt: new Date().toISOString(),
  };

  return [newStore];
}

export function createNewStoreForUser(
  user: MerchantUser,
  businessName: string,
  businessType: BusinessType = 'food',
  whatsappNumber: string = user.phone
): StoreProfile {
  // Choose matching template items based on business type
  const template = DEFAULT_STORES.find((s) => s.businessType === businessType) || DEFAULT_STORES[0];

  return {
    id: `store-${Date.now()}`,
    slug: slugify(businessName) || `store-${Date.now().toString().slice(-4)}`,
    ownerId: user.id,
    businessType,
    businessName: businessName.trim(),
    whatsappNumber: whatsappNumber.trim().startsWith('+91')
      ? whatsappNumber.trim()
      : `+91 ${whatsappNumber.replace(/\D/g, '')}`,
    currency: '₹',
    tagline: template.tagline,
    city: 'India',
    deliveryNote: template.deliveryNote,
    items: JSON.parse(JSON.stringify(template.items)),
    updatedAt: new Date().toISOString(),
  };
}
