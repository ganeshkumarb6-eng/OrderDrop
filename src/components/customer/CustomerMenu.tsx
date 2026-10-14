import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Share2,
  Phone,
  Check,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CartItem, OrderCustomerInfo, StoreProfile } from '../../types';
import { VegBadge } from '../common/VegBadge';
import { CheckoutDrawer } from './CheckoutDrawer';
import { OrderSuccessModal } from './OrderSuccessModal';

interface CustomerMenuProps {
  store: StoreProfile;
  onSwitchToMerchant?: () => void;
  isSimulatorView?: boolean;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  store,
  onSwitchToMerchant,
  isSimulatorView = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [activeItemForSize, setActiveItemForSize] = useState<string | null>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    customer: OrderCustomerInfo;
    messageText: string;
    whatsappUrl: string;
  } | null>(null);

  const currency = store.currency || '₹';
  const type = store.businessType || 'food';

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    store.items.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [store.items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return store.items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (type === 'food' && vegOnlyFilter && !item.isVeg) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCat = item.category?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [store.items, selectedCategory, vegOnlyFilter, searchQuery, type]);

  // Cart calculations
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.item.price, 0);
  }, [cart]);

  const getItemQuantity = (itemId: string): number => {
    return cart.filter((c) => c.item.id === itemId).reduce((sum, c) => sum + c.quantity, 0);
  };

  const handleUpdateQuantity = (itemId: string, delta: number, size?: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === itemId && (size ? c.selectedSize === size : true));
      if (!existing) {
        if (delta > 0) {
          const menuItem = store.items.find((i) => i.id === itemId);
          if (menuItem) {
            const chosenSize = size || (menuItem.sizes && menuItem.sizes.length > 0 ? menuItem.sizes[0] : undefined);
            return [...prev, { item: menuItem, quantity: 1, selectedSize: chosenSize }];
          }
        }
        return prev;
      }

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((c) => !(c.item.id === itemId && (size ? c.selectedSize === size : true)));
      }
      return prev.map((c) =>
        c.item.id === itemId && (size ? c.selectedSize === size : true)
          ? { ...c, quantity: newQty }
          : c
      );
    });
  };

  const handleShareMenu = () => {
    if (navigator.share) {
      navigator
        .share({
          title: store.businessName,
          text: `Check out ${store.businessName} & order directly on WhatsApp!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen bg-stone-50/60 pb-32 ${isSimulatorView ? 'max-w-md mx-auto min-h-[640px] shadow-xl rounded-3xl overflow-hidden border border-neutral-200' : ''}`}>
      
      {/* Top Bar for Switcher */}
      {onSwitchToMerchant && !isSimulatorView && (
        <div className="bg-neutral-900 text-neutral-300 text-xs py-2 px-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Live Customer View</span>
            <span className="text-neutral-500">· WhatsApp Storefront</span>
          </div>
          <button
            type="button"
            onClick={onSwitchToMerchant}
            className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Back to Builder</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <header className="bg-white border-b border-neutral-200/70 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {type === 'food' && 'Direct WhatsApp Kitchen'}
                  {type === 'fashion' && 'Direct WhatsApp Boutique'}
                  {type === 'crafts' && 'Direct WhatsApp Studio'}
                  {type === 'general' && 'Direct WhatsApp Store'}
                </span>
                {store.city && (
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    {store.city}
                  </span>
                )}
              </div>

              {/* Business Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                {store.businessName}
              </h1>

              {/* Tagline */}
              {store.tagline && (
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {store.tagline}
                </p>
              )}

              {/* WhatsApp details */}
              <div className="flex items-center gap-2 mt-2.5 text-xs">
                <a
                  href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{store.whatsappNumber}</span>
                </a>
              </div>
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShareMenu}
              className="p-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
              title="Share"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Delivery Note */}
          {store.deliveryNote && (
            <div className="mt-4 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center gap-2 text-xs text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{store.deliveryNote}</span>
            </div>
          )}
        </div>
      </header>

      {/* Sticky Category & Search Navigation */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 py-2.5 space-y-2">
          {/* Search bar & Veg Only toggle (Food only) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={type === 'food' ? 'Search food items...' : 'Search collection...'}
                className="w-full pl-9 pr-7 py-2 rounded-xl bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 border border-transparent focus:border-neutral-300 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Veg Only (Only shown when Food) */}
            {type === 'food' && (
              <button
                type="button"
                onClick={() => setVegOnlyFilter((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                  vegOnlyFilter
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <VegBadge isVeg={true} size="sm" />
                <span>Veg Only</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Items Grid */}
      <main className="max-w-2xl mx-auto px-4 py-5">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Search className="w-6 h-6 stroke-1" />
            </div>
            <p className="text-sm font-bold text-neutral-800">No items matched your filter</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              const hasSizes = item.sizes && item.sizes.length > 0;
              const isPickingSize = activeItemForSize === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border border-neutral-200/70 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between ${
                    !item.isAvailable ? 'opacity-60 bg-neutral-50/80' : ''
                  }`}
                >
                  {/* Left: Text Details */}
                  <div className="flex-1 min-w-0 pr-1 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 mb-1">
                      {type === 'food' && <VegBadge isVeg={item.isVeg ?? true} />}
                      {item.bestseller && (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                          ★ Best Seller
                        </span>
                      )}
                      {item.category && selectedCategory === 'All' && (
                        <span className="text-[11px] text-neutral-400 font-medium">
                          · {item.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-sm sm:text-base font-extrabold text-neutral-900 mt-0.5">
                      {currency}{item.price}
                    </p>

                    {item.description && (
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Fashion: Size Pills */}
                    {hasSizes && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Sizes:</span>
                        {item.sizes!.map((s) => (
                          <span key={s} className="text-[10px] font-bold px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Visual Image & Cart Actions */}
                  <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto flex-shrink-0 gap-2">
                    <div className="relative w-20 h-20 sm:w-26 sm:h-26 rounded-2xl overflow-hidden bg-neutral-100 shadow-2xs border border-neutral-100">
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
                        }
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center p-1">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stepper / Add button */}
                    <div className="sm:-mt-3.5 z-10">
                      {item.isAvailable ? (
                        hasSizes && isPickingSize ? (
                          <div className="p-1.5 bg-neutral-900 text-white rounded-xl shadow-lg flex items-center gap-1">
                            {item.sizes!.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  handleUpdateQuantity(item.id, 1, sz);
                                  setActiveItemForSize(null);
                                }}
                                className="px-2 py-1 text-xs font-bold hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
                              >
                                {sz}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setActiveItemForSize(null)}
                              className="px-1 text-[10px] text-neutral-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (hasSizes && item.sizes!.length > 1) {
                                setActiveItemForSize(item.id);
                              } else {
                                handleUpdateQuantity(item.id, 1);
                              }
                            }}
                            className="px-4 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-400 font-extrabold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-700" />
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center rounded-xl bg-emerald-700 text-white shadow-md overflow-hidden border border-emerald-800">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-white hover:bg-emerald-800 active:bg-emerald-900 transition-colors cursor-pointer"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-black">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (hasSizes && item.sizes!.length > 1) {
                                  setActiveItemForSize(item.id);
                                } else {
                                  handleUpdateQuantity(item.id, 1);
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center text-white hover:bg-emerald-800 active:bg-emerald-900 transition-colors cursor-pointer"
                              aria-label="Increase"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400 uppercase bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Sticky Bar when items are in cart */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-4 inset-x-0 z-40 px-4 max-w-lg mx-auto"
          >
            <div
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl shadow-emerald-950/30 flex items-center justify-between cursor-pointer transition-all transform active:scale-[0.99] border border-emerald-500/70"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-100">
                    {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in cart
                  </p>
                  <p className="text-base sm:text-lg font-black leading-tight">
                    {currency}{totalCartAmount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white text-emerald-900 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm">
                <span>View Cart & Order</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Drawer */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        store={store}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={() => setCart([])}
        onOrderPlaced={(orderInfo) => {
          setIsCheckoutOpen(false);
          setOrderSuccessData(orderInfo);
        }}
      />

      {/* Order Success & WhatsApp Redirection Modal */}
      <OrderSuccessModal
        isOpen={!!orderSuccessData}
        onClose={() => {
          setOrderSuccessData(null);
          setCart([]);
        }}
        orderDetails={orderSuccessData}
        store={store}
      />
    </div>
  );
};
