import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  QrCode,
  ExternalLink,
  Edit2,
  Trash2,
  Phone,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Share2,
  Send,
  Zap,
  Printer,
  Download,
  Camera,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import QRCode from 'qrcode';
import { MenuItem, StoreProfile, BusinessType, MerchantUser } from '../../types';
import { VegBadge } from '../common/VegBadge';
import { MenuItemModal } from './MenuItemModal';
import { QRCodeModal } from './QRCodeModal';
import { TableStandeeModal } from './TableStandeeModal';
import { InstagramStoryModal } from './InstagramStoryModal';
import { CustomerMenu } from '../customer/CustomerMenu';
import { DEFAULT_STORES } from '../../data/defaultStores';
import { slugify } from '../../utils/storage';
import { sanitizeWhatsAppNumber, buildWhatsAppLink } from '../../utils/whatsapp';

interface MerchantDashboardProps {
  store: StoreProfile;
  onUpdateStore: (updated: StoreProfile) => void;
  onOpenCustomerView: () => void;
  publicUrl: string;
  user?: MerchantUser | null;
  onLogout?: () => void;
  userStores?: StoreProfile[];
  onSelectStore?: (store: StoreProfile) => void;
  onCreateNewStore?: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  store,
  onUpdateStore,
  onOpenCustomerView,
  publicUrl,
  user,
  onLogout,
  userStores = [],
  onSelectStore,
  onCreateNewStore,
}) => {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Canvas ref for direct QR display on dashboard
  const dashboardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render QR Code directly on dashboard canvas whenever publicUrl or store changes
  useEffect(() => {
    if (dashboardCanvasRef.current && publicUrl) {
      QRCode.toCanvas(
        dashboardCanvasRef.current,
        publicUrl,
        {
          width: 170,
          margin: 1,
          color: {
            dark: '#064e3b', // Deep emerald
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('Error rendering dashboard QR:', error);
        }
      );
    }
  }, [publicUrl, store.slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleProfileFieldChange = (field: keyof StoreProfile, value: any) => {
    const updated = { ...store, [field]: value };
    if (field === 'businessName') {
      updated.slug = slugify(value) || 'my-store';
    }
    onUpdateStore(updated);
  };

  const handleBusinessTypeChange = (newType: BusinessType) => {
    const preset = DEFAULT_STORES.find((s) => s.businessType === newType);
    if (preset) {
      onUpdateStore({
        ...preset,
        id: store.id,
        businessName: store.businessName || preset.businessName,
        whatsappNumber: store.whatsappNumber || preset.whatsappNumber,
        currency: store.currency || '₹',
        updatedAt: new Date().toISOString(),
      });
      showToast(`Switched to ${newType} template with sample items`);
      return;
    }

    onUpdateStore({ ...store, businessType: newType });
    showToast(`Business type updated to ${newType}`);
  };

  const handleSaveItem = (item: MenuItem) => {
    let updatedItems = [...store.items];
    const index = updatedItems.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      updatedItems[index] = item;
      showToast(`Updated "${item.name}"`);
    } else {
      updatedItems.push(item);
      showToast(`Added "${item.name}"`);
    }
    onUpdateStore({ ...store, items: updatedItems });
  };

  const handleDeleteItem = (id: string, name: string) => {
    const updatedItems = store.items.filter((i) => i.id !== id);
    onUpdateStore({ ...store, items: updatedItems });
    showToast(`Removed "${name}"`);
  };

  const handleToggleAvailability = (id: string) => {
    const updatedItems = store.items.map((i) =>
      i.id === id ? { ...i, isAvailable: !i.isAvailable } : i
    );
    onUpdateStore({ ...store, items: updatedItems });
  };

  const handleLoadPreset = (presetSlug: string) => {
    const found = DEFAULT_STORES.find((s) => s.slug === presetSlug);
    if (found) {
      onUpdateStore({
        ...found,
        id: `store-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Loaded "${found.businessName}" template`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    showToast('Store link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Download the dashboard QR directly as a PNG
  const handleDownloadDashboardQR = () => {
    if (!dashboardCanvasRef.current) return;
    const url = dashboardCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.slug}-counter-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded High-Res QR code PNG!');
  };

  const handleSendTestOrder = () => {
    const item = store.items[0];
    const testMessage = `🛍️ *TEST ORDER (QuickMenu)* 🛍️
------------------------------------
*Customer Details:*
• Name: Test Customer
• Order Type: ${store.businessType === 'food' ? 'Home Delivery' : 'Courier Shipping'}

*Delivery Address:*
Flat 101, Green View Apartments, Bangalore
------------------------------------
*Order Items:*
📦 1 x ${item?.name || 'Sample Item'} (${store.currency || '₹'}${item?.price || 499} each) - ${store.currency || '₹'}${item?.price || 499}
------------------------------------
💰 *Bill Summary:*
• *Total Amount to Pay: ${store.currency || '₹'}${item?.price || 499}*

✨ *Note:* Testing WhatsApp order routing!`;

    const testUrl = buildWhatsAppLink(store.whatsappNumber, testMessage);
    window.open(testUrl, '_blank', 'noopener,noreferrer');
  };

  const isWhatsAppConfigured = sanitizeWhatsAppNumber(store.whatsappNumber).length >= 10;
  const currentType = store.businessType || 'food';

  return (
    <div className="min-h-screen bg-stone-50/60 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-neutral-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-neutral-900 text-base tracking-tight">
                  QuickMenu
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                  {currentType === 'food' ? 'Food & Bakery' : currentType === 'fashion' ? 'Fashion Boutique' : currentType === 'crafts' ? 'Handmade & Gifts' : 'Retail Catalog'}
                </span>
              </div>
            </div>

            {/* Store Switcher (if user has stores) */}
            {userStores.length > 1 && onSelectStore && (
              <div className="hidden md:flex items-center gap-1.5 ml-2 border-l border-neutral-200 pl-3">
                <span className="text-[11px] text-neutral-400 font-bold uppercase">Store:</span>
                <select
                  value={store.id}
                  onChange={(e) => {
                    const chosen = userStores.find((s) => s.id === e.target.value);
                    if (chosen) onSelectStore(chosen);
                  }}
                  className="text-xs font-bold text-neutral-900 bg-stone-100 rounded-lg px-2 py-1 border border-neutral-200 cursor-pointer"
                >
                  {userStores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.businessName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCustomerView}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-700" />
              <span>Preview Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setIsStandeeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Standee</span>
            </button>

            {/* Logged in User Profile & Logout */}
            {user && (
              <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-2 ml-1">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-neutral-900 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                    {user.phone || user.email}
                  </span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>


      {/* Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Controls (Span 7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 🌟 HERO CARD: Live Link & Quick Tools */}
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-neutral-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/50 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Your Live WhatsApp Link
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
                    Share with your customers
                  </h2>
                  <p className="text-xs text-emerald-100/80 mt-1 max-w-md">
                    Customers click your link, browse visually, and send completed carts straight to your WhatsApp!
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5 text-emerald-300" />
                </div>
              </div>

              {/* URL Display Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-neutral-950/60 rounded-2xl border border-white/10 backdrop-blur-xs">
                <span className="text-xs font-mono text-emerald-200 truncate px-3 py-1 flex-1 select-all">
                  {publicUrl}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenCustomerView}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Open Menu"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Tools */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsStandeeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Print Standee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-rose-500/30 hover:from-amber-500/40 hover:to-rose-500/40 text-white font-semibold flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Instagram Story Graphic</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendTestOrder}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* 🖨️ DEDICATED LIVE QR CODE & COUNTER STANDEE CARD */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-base leading-tight">
                      Counter QR Code & Standee
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Live QR linking to your digital menu—ready to print for your counter
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                  Ready to Print
                </span>
              </div>

              {/* Counter Display & Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Left: Standee Mockup Container */}
                <div className="sm:col-span-5 flex justify-center">
                  <div className="bg-stone-50 border-2 border-emerald-600/30 rounded-2xl p-4 shadow-sm text-center max-w-[210px] w-full">
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider block mb-2">
                      Scan to Order
                    </span>
                    <h4 className="text-xs font-black text-neutral-900 truncate">
                      {store.businessName}
                    </h4>

                    {/* Canvas QR Code */}
                    <div className="my-2.5 p-2 bg-white rounded-xl border border-neutral-200 shadow-2xs inline-block">
                      <canvas ref={dashboardCanvasRef} className="mx-auto max-w-full h-auto rounded-lg" />
                    </div>

                    <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-600 font-bold">
                      <Camera className="w-3 h-3 text-emerald-600" />
                      <span>Point Phone Camera</span>
                    </div>
                    <p className="text-[9px] text-emerald-800 font-semibold mt-0.5 truncate">
                      Direct WhatsApp Ordering
                    </p>
                  </div>
                </div>

                {/* Right: Actions & Printing Guidelines */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-neutral-900">
                      Place on Counters, Dining Tables, or Packaging
                    </h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Customers don't need to install any app. When they scan this with their iPhone or Android camera, your visual menu opens instantly and orders go straight to your WhatsApp.
                    </p>
                  </div>

                  {/* Print and Download CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsStandeeModalOpen(true)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Counter Standee</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadDashboardQR}
                      className="py-2.5 px-3.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Download PNG</span>
                    </button>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-stone-50 rounded-xl p-2.5 text-[11px] text-neutral-600 space-y-1 border border-neutral-100">
                    <p className="flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>Recommended print: 4×6 inch tent card or A5 acrylic standee</span>
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>Also great as a sticker on cake boxes & takeaway parcels</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Business Category & Details */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base leading-tight">
                      Business Category & Contact
                    </h3>
                  </div>
                </div>

                {isWhatsAppConfigured ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Ready
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Enter 10-digit number
                  </span>
                )}
              </div>

              {/* Business Type Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Select Business Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBusinessTypeChange('food')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      currentType === 'food'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                        : 'border-neutral-200 bg-stone-50/50 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-lg">🍰</span>
                    <div className="mt-2">
                      <p className="text-xs font-extrabold text-neutral-900 leading-tight">Food & Bakery</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Veg badges, Dine/Takeaway</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBusinessTypeChange('fashion')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      currentType === 'fashion'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                        : 'border-neutral-200 bg-stone-50/50 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-lg">👗</span>
                    <div className="mt-2">
                      <p className="text-xs font-extrabold text-neutral-900 leading-tight">Fashion & Thrift</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Sizes S-XXL, Courier</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBusinessTypeChange('crafts')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      currentType === 'crafts'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                        : 'border-neutral-200 bg-stone-50/50 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-lg">🎁</span>
                    <div className="mt-2">
                      <p className="text-xs font-extrabold text-neutral-900 leading-tight">Handmade & Gifts</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Candles, Custom notes</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBusinessTypeChange('general')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      currentType === 'general'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                        : 'border-neutral-200 bg-stone-50/50 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-lg">🛍️</span>
                    <div className="mt-2">
                      <p className="text-xs font-extrabold text-neutral-900 leading-tight">General Store</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Clean visual catalog</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Store / Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={store.businessName}
                    onChange={(e) => handleProfileFieldChange('businessName', e.target.value)}
                    placeholder="e.g. Hyderabad Bakes or Aura Boutique"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    WhatsApp Order Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-neutral-500 pointer-events-none">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-bold">IN</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={store.whatsappNumber}
                      onChange={(e) => handleProfileFieldChange('whatsappNumber', e.target.value)}
                      placeholder="+91 98490 12345"
                      className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Tagline / Speciality
                  </label>
                  <input
                    type="text"
                    value={store.tagline || ''}
                    onChange={(e) => handleProfileFieldChange('tagline', e.target.value)}
                    placeholder="e.g. Artisanal Sourdough & Custom Celebration Cakes"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    UPI ID for Direct Payment (Optional)
                  </label>
                  <input
                    type="text"
                    value={store.upiId || ''}
                    onChange={(e) => handleProfileFieldChange('upiId', e.target.value)}
                    placeholder="e.g. yourbusiness@okaxis"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Product / Menu Management */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base leading-tight">
                      {currentType === 'food' ? 'Food Dishes' : 'Products & Catalog'} ({store.items.length})
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null);
                      setIsItemModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {currentType === 'food' ? 'Dish' : 'Product'}</span>
                  </button>
                </div>
              </div>

              {/* Ready-to-Test Template Bar */}
              <div className="flex items-center gap-2 p-2.5 bg-neutral-100/70 rounded-2xl text-xs overflow-x-auto no-scrollbar">
                <span className="text-neutral-500 font-medium whitespace-nowrap">Load Templates:</span>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('hyderabad-bakes')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-neutral-800 font-bold border border-neutral-200 text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  🎂 Hyderabad Bakes
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('spice-craft-kitchen')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-neutral-800 font-bold border border-neutral-200 text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  🍗 Spice Craft
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('aura-boutique')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-neutral-800 font-bold border border-neutral-200 text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  👗 Aura Boutique
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('lumiere-candles-gifts')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-neutral-800 font-bold border border-neutral-200 text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  🎁 Lumière Candles
                </button>
              </div>

              {/* Items Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {store.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex gap-3 items-center justify-between ${
                      item.isAvailable
                        ? 'border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs'
                        : 'border-neutral-200 bg-neutral-50 opacity-60'
                    }`}
                  >
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-neutral-100"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {currentType === 'food' && <VegBadge isVeg={item.isVeg ?? true} />}
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs font-black text-neutral-900">
                        {store.currency}{item.price}
                      </p>
                      {item.sizes && item.sizes.length > 0 && (
                        <p className="text-[10px] text-neutral-500 truncate">
                          Sizes: {item.sizes.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setIsItemModalOpen(true);
                          }}
                          className="p-1 rounded-md text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Mobile Customer Preview on Desktop */}
          <div className="hidden lg:block lg:col-span-5 sticky top-20">
            <div className="bg-white p-4 rounded-3xl border border-neutral-200/90 shadow-md">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-neutral-800">
                    Live Mobile Customer Preview
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenCustomerView}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Screen</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* iPhone style frame */}
              <div className="w-full h-[620px] rounded-2xl overflow-y-auto border-4 border-neutral-800 bg-stone-50 shadow-inner relative">
                <CustomerMenu store={store} isSimulatorView={true} />
              </div>

              <div className="text-center mt-3 text-[11px] text-neutral-400">
                Customers see this exact menu when they scan your counter QR!
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Item Modal */}
      <MenuItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        itemToEdit={editingItem}
        currency={store.currency || '₹'}
        businessType={currentType}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        store={store}
        publicUrl={publicUrl}
        onOpenStandee={() => {
          setIsQRModalOpen(false);
          setIsStandeeModalOpen(true);
        }}
        onOpenCustomerView={onOpenCustomerView}
      />

      {/* Standee Flyer Modal */}
      <TableStandeeModal
        isOpen={isStandeeModalOpen}
        onClose={() => setIsStandeeModalOpen(false)}
        store={store}
        publicUrl={publicUrl}
      />

      {/* Instagram Story Graphic Modal */}
      <InstagramStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        store={store}
        publicUrl={publicUrl}
      />
    </div>
  );
};
