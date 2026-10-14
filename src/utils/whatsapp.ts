import { CartItem, OrderCustomerInfo, StoreProfile } from '../types';

export function sanitizeWhatsAppNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  return digits;
}

export function formatOrderWhatsAppMessage({
  customer,
  cart,
  store,
}: {
  customer: OrderCustomerInfo;
  cart: CartItem[];
  store: StoreProfile;
}): string {
  const currency = store.currency || '₹';
  const type = store.businessType || 'food';

  // Customize header emoji & banner based on business type
  let headerBanner = '🍔 *NEW ORDER PLACED* 🍔';
  if (type === 'fashion') headerBanner = '👗 *NEW BOUTIQUE ORDER PLACED* 👗';
  if (type === 'crafts') headerBanner = '🎁 *NEW HANDMADE / GIFT ORDER PLACED* 🎁';
  if (type === 'general') headerBanner = '🛍️ *NEW ORDER PLACED* 🛍️';

  // Items text
  const itemsText = cart
    .map((c) => {
      const subtotal = c.quantity * c.item.price;
      const sizeNote = c.selectedSize ? ` [Size: ${c.selectedSize}]` : '';
      const customNote = c.customNote ? ` (Note: ${c.customNote})` : '';
      return `📦 ${c.quantity} x ${c.item.name}${sizeNote}${customNote} (${currency}${c.item.price} each) - ${currency}${subtotal}`;
    })
    .join('\n');

  const grandTotal = cart.reduce((sum, c) => sum + c.quantity * c.item.price, 0);

  const deliveryLabel =
    type === 'food'
      ? customer.deliveryType === 'Takeaway'
        ? 'Takeaway / Store Pickup'
        : 'Home Delivery'
      : customer.deliveryType === 'Takeaway'
      ? 'Store / Studio Pickup'
      : 'Courier / Home Shipping';

  const addressLine =
    customer.deliveryType === 'Takeaway'
      ? customer.address.trim()
        ? `${customer.address} (Pickup)`
        : 'Store Pickup'
      : customer.address.trim() || 'Address to be shared on chat';

  let message = `${headerBanner}
------------------------------------
*Customer Details:*
• Name: ${customer.name || 'Customer'}
• Order Type: ${deliveryLabel}

*Delivery Address:*
${addressLine}
------------------------------------
*Order Items:*
${itemsText}
------------------------------------
💰 *Bill Summary:*
• *Total Amount to Pay: ${currency}${grandTotal}*`;

  if (customer.specialInstructions && customer.specialInstructions.trim()) {
    message += `\n\n📝 *Notes:* ${customer.specialInstructions.trim()}`;
  }

  if (store.upiId && store.upiId.trim()) {
    message += `\n\n💳 *Instant UPI Payment:* ${store.upiId.trim()}`;
  }

  return message;
}

export function buildWhatsAppLink(phoneNumber: string, messageText: string): string {
  const cleanPhone = sanitizeWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
