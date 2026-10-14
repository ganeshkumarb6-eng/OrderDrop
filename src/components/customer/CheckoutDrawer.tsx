import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ArrowRight, ShieldCheck, MapPin, ShoppingBag, Store, Package } from 'lucide-react';
import { CartItem, OrderCustomerInfo, StoreProfile } from '../../types';
import { VegBadge } from '../common/VegBadge';
import { buildWhatsAppLink, formatOrderWhatsAppMessage } from '../../utils/whatsapp';
import confetti from 'canvas-confetti';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  store: StoreProfile;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (orderDetails: { customer: OrderCustomerInfo; messageText: string; whatsappUrl: string }) => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  store,
  onUpdateQuantity,
  onOrderPlaced,
}) => {
  const [customer, setCustomer] = useState<OrderCustomerInfo>({
    name: '',
    deliveryType: 'Delivery',
    address: '',
    specialInstructions: '',
  });

  const [formErrors, setFormErrors] = useState<{ name?: string; address?: string }>({});

  const currency = store.currency || '₹';
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.item.price, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const type = store.businessType || 'food';

  const validate = (): boolean => {
    const errors: { name?: string; address?: string } = {};
    if (!customer.name.trim()) {
      errors.name = 'Please enter your name';
    }
    if (customer.deliveryType === 'Delivery' && !customer.address.trim()) {
      errors.address = type === 'food' ? 'Please provide your delivery address or landmark' : 'Please provide full courier shipping address with PIN code';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!validate()) return;

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#10B981', '#34D399', '#FBBF24'],
      });
    } catch {
      // ignore
    }

    const messageText = formatOrderWhatsAppMessage({
      customer,
      cart,
      store,
    });

    const whatsappUrl = buildWhatsAppLink(store.whatsappNumber, messageText);

    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // popup blocker
    }

    onOrderPlaced({
      customer,
      messageText,
      whatsappUrl,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base leading-tight">Your Cart</h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    Ordering from {store.businessName} ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-200/70 text-neutral-600 flex items-center justify-center hover:bg-neutral-300 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1 divide-y divide-neutral-100">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-2 stroke-1" />
                  <p className="text-sm font-semibold">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Order Items</p>
                    {cart.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50/80 border border-neutral-200/70 hover:border-neutral-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {type === 'food' && <VegBadge isVeg={cartItem.item.isVeg ?? true} />}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-neutral-900 truncate">{cartItem.item.name}</p>
                            <p className="text-xs text-neutral-500 font-medium">
                              {cartItem.selectedSize && <span className="font-bold text-neutral-700 mr-1.5">[Size: {cartItem.selectedSize}]</span>}
                              {currency}{cartItem.item.price} each
                            </p>
                          </div>
                        </div>

                        {/* Stepper & Subtotal */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center border border-neutral-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(cartItem.item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-neutral-800">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(cartItem.item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-black text-neutral-900 w-16 text-right">
                            {currency}{cartItem.quantity * cartItem.item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Details Form */}
                  <form id="checkout-form" onSubmit={handlePlaceOrder} className="pt-4 space-y-4">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      {type === 'food' ? 'Delivery & Contact Details' : 'Shipping & Customer Details'}
                    </p>

                    {/* Delivery / Shipping Toggle */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order Fulfillment</label>
                      <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setCustomer((prev) => ({ ...prev, deliveryType: 'Delivery' }))}
                          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            customer.deliveryType === 'Delivery'
                              ? 'bg-white text-emerald-800 shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {type === 'food' ? <MapPin className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                          {type === 'food' ? 'Home Delivery' : 'Courier Shipping'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomer((prev) => ({ ...prev, deliveryType: 'Takeaway' }))}
                          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            customer.deliveryType === 'Takeaway'
                              ? 'bg-white text-emerald-800 shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5" />
                          {type === 'food' ? 'Store Pickup' : 'Studio Pickup'}
                        </button>
                      </div>
                    </div>

                    {/* Customer Name */}
                    <div>
                      <label htmlFor="customer-name" className="block text-xs font-bold text-neutral-700 mb-1">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        required
                        value={customer.name}
                        onChange={(e) => {
                          setCustomer((prev) => ({ ...prev, name: e.target.value }));
                          if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="e.g. Priya Sharma"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                          formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-200'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Address / Pickup */}
                    <div>
                      <label htmlFor="customer-address" className="block text-xs font-bold text-neutral-700 mb-1">
                        {customer.deliveryType === 'Delivery' ? (
                          <>
                            {type === 'food' ? 'Delivery Address & Landmark' : 'Full Shipping Address with PIN code'}{' '}
                            <span className="text-rose-500">*</span>
                          </>
                        ) : (
                          'Pickup Notes (Optional)'
                        )}
                      </label>
                      <textarea
                        id="customer-address"
                        rows={2}
                        value={customer.address}
                        onChange={(e) => {
                          setCustomer((prev) => ({ ...prev, address: e.target.value }));
                          if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: undefined }));
                        }}
                        placeholder={
                          customer.deliveryType === 'Delivery'
                            ? type === 'food'
                              ? 'Flat / House No, Building Name, Street, Landmark, Pin code'
                              : 'House/Flat No, Street, City, State, PIN Code'
                            : 'e.g. Will pick up in evening'
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none ${
                          formErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-200'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.address}</p>
                      )}
                    </div>

                    {/* Special Notes / Personalization */}
                    <div>
                      <label htmlFor="special-notes" className="block text-xs font-bold text-neutral-600 mb-1">
                        {type === 'crafts' ? 'Personalization / Gift Card Message (Optional)' : 'Special Instructions / Notes (Optional)'}
                      </label>
                      <input
                        id="special-notes"
                        type="text"
                        value={customer.specialInstructions || ''}
                        onChange={(e) => setCustomer((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                        placeholder={
                          type === 'crafts'
                            ? 'e.g. Please engrave name "Aarav" or write Happy Birthday note'
                            : 'e.g. Leave with security / Less spicy'
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </form>

                  {/* Bill Summary */}
                  <div className="pt-4 space-y-2">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Bill Summary</p>
                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-neutral-200/70 space-y-2 text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Items Total ({totalItemCount})</span>
                        <span className="font-bold text-neutral-900">
                          {currency}{subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Fulfillment</span>
                        <span className="text-emerald-700 font-bold">
                          {customer.deliveryType === 'Delivery' ? 'Merchant confirms shipping' : 'Free Pickup'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline font-black text-neutral-900 text-sm">
                        <span>Total to Pay</span>
                        <span className="text-base text-emerald-800">
                          {currency}{subtotal}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Direct order to merchant on WhatsApp. Pay directly via UPI / COD.</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer with WhatsApp CTA */}
            {cart.length > 0 && (
              <div className="p-4 bg-white border-t border-neutral-100 shadow-lg">
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all transform active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.77.462 3.498 1.341 5.02L2 22l5.088-1.334A9.998 9.998 0 0 0 12.031 22C17.566 22 22 17.566 22 12.031S17.566 2 12.031 2zm0 18.283c-1.536 0-3.042-.413-4.364-1.196l-.313-.186-3.242.85.865-3.161-.205-.326a8.252 8.252 0 0 1-1.267-4.433c0-4.57 3.717-8.287 8.287-8.287 4.57 0 8.287 3.717 8.287 8.287 0 4.57-3.717 8.287-8.287 8.287zm4.542-6.208c-.249-.125-1.472-.727-1.7-.81-.228-.083-.395-.125-.561.125-.166.249-.644.81-.789.977-.145.166-.291.187-.54.062s-1.05-.387-2.001-1.234c-.74-.66-1.24-1.476-1.385-1.725s-.015-.383.109-.507c.112-.112.249-.291.374-.436.125-.145.166-.249.249-.415.083-.166.042-.312-.021-.436s-.561-1.352-.769-1.851c-.202-.486-.407-.42-.561-.428-.145-.008-.312-.01-.478-.01s-.436.062-.664.312c-.228.249-.873.852-.873 2.079s.894 2.41 1.018 2.577c.125.166 1.758 2.684 4.26 3.766.595.257 1.06.411 1.423.526.598.19 1.142.163 1.572.099.479-.071 1.472-.602 1.68-1.185.208-.582.208-1.081.145-1.185-.062-.104-.228-.166-.477-.291z" />
                  </svg>
                  <span>Place Order via WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
