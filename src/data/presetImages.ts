import { BusinessType } from '../types';

export interface PresetImage {
  label: string;
  category: string;
  businessType: BusinessType;
  url: string;
}

export const PRESET_IMAGES: PresetImage[] = [
  // --- FOOD & BAKERY ---
  {
    label: 'Chocolate Truffle Cake',
    category: 'Bakery & Desserts',
    businessType: 'food',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Artisanal Sourdough Loaf',
    category: 'Bakery & Desserts',
    businessType: 'food',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Golden Butter Croissant',
    category: 'Bakery & Desserts',
    businessType: 'food',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Dum Hyderabadi Biryani',
    category: 'Main Course',
    businessType: 'food',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Paneer Butter Masala',
    category: 'Main Course',
    businessType: 'food',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Crispy Punjabi Samosas',
    category: 'Snacks',
    businessType: 'food',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Cold Coffee with Ice Cream',
    category: 'Beverages',
    businessType: 'food',
    url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
  },

  // --- FASHION & THRIFT BOUTIQUE ---
  {
    label: 'Hand-block Print Kurti',
    category: 'Ethnic Wear',
    businessType: 'fashion',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Pure Cotton Floral Anarkali',
    category: 'Ethnic Wear',
    businessType: 'fashion',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Oversized Streetwear Graphic Tee',
    category: 'Western & Streetwear',
    businessType: 'fashion',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Vintage Denim Jacket',
    category: 'Thrift & Outerwear',
    businessType: 'fashion',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Oxidised Silver Jhumkas',
    category: 'Jewelry & Accessories',
    businessType: 'fashion',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Handwoven Tote Bag',
    category: 'Bags & Accessories',
    businessType: 'fashion',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
  },

  // --- HANDMADE CRAFTS, CANDLES & GIFTS ---
  {
    label: 'French Vanilla Scented Soy Candle',
    category: 'Scented Candles',
    businessType: 'crafts',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Customized Ocean Resin Clock',
    category: 'Resin Art',
    businessType: 'crafts',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Diwali & Wedding Gift Hamper',
    category: 'Gift Hampers',
    businessType: 'crafts',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Mini Polaroid Memory Photo Album',
    category: 'Personalized Gifts',
    businessType: 'crafts',
    url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Succulent Desk Planter in Ceramic Pot',
    category: 'Home & Living',
    businessType: 'crafts',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
  },
];
