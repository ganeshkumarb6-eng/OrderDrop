export type BusinessType = 'food' | 'fashion' | 'crafts' | 'general';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  bestseller?: boolean;
  // Specific to Food
  isVeg?: boolean;
  // Specific to Fashion & Apparel
  sizes?: string[]; // e.g. ['S', 'M', 'L', 'XL'] or ['Free Size']
  // Specific to Crafts / Gifting
  allowCustomNote?: boolean;
}

export interface StoreProfile {
  id: string;
  slug: string;
  businessType: BusinessType;
  businessName: string;
  whatsappNumber: string; // e.g. "+91 98490 12345"
  currency: string; // e.g. "₹"
  tagline: string;
  city: string;
  address?: string;
  upiId?: string;
  deliveryNote?: string;
  items: MenuItem[];
  updatedAt: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedSize?: string;
  customNote?: string;
}

export interface OrderCustomerInfo {
  name: string;
  deliveryType: 'Delivery' | 'Takeaway' | 'Shipping';
  address: string;
  customerPhone?: string;
  specialInstructions?: string;
}
