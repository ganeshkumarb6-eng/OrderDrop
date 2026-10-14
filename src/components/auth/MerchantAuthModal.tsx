import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Mail, User, Store, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { MerchantUser, BusinessType } from '../../types';
import { registerUser, loginUser } from '../../utils/auth';

interface MerchantAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: MerchantUser, initialBusinessType?: BusinessType, storeName?: string) => void;
  defaultMode?: 'register' | 'login';
}

export const MerchantAuthModal: React.FC<MerchantAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'register',
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(defaultMode);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [businessType, setBusinessType] = useState<BusinessType>('food');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (cleanPhone.replace(/\D/g, '').length < 10) {
        setError('Please enter your 10-digit WhatsApp phone number');
        return;
      }

      const user = registerUser(name, cleanEmail, cleanPhone);
      onSuccess(user, businessType, businessName.trim() || undefined);
      onClose();
    } else {
      // Login mode
      if (!cleanEmail && cleanPhone.replace(/\D/g, '').length < 10) {
        setError('Please enter your email or phone number to sign in');
        return;
      }

      const user = loginUser(cleanEmail || cleanPhone);
      if (user) {
        onSuccess(user);
        onClose();
      } else {
        setError('Account not found. Please create an account to start.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 overflow-hidden text-neutral-900"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2.5 font-black text-xl shadow-xs">
              Q
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              {mode === 'register' ? 'Create Your Merchant Account' : 'Merchant Login'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              {mode === 'register'
                ? 'Launch your digital menu & start receiving WhatsApp orders in 60 seconds'
                : 'Enter your email or phone to manage your store menu'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              New Merchant (Register)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Business / Restaurant Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Business / Restaurant Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Royal Hyderabadi Bakes or Spice Villa"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Business Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Business Category</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setBusinessType('food')}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        businessType === 'food'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-neutral-200 bg-stone-50/50 text-neutral-600'
                      }`}
                    >
                      <span>🍰</span>
                      <span>Food & Bakery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusinessType('fashion')}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        businessType === 'fashion'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-neutral-200 bg-stone-50/50 text-neutral-600'
                      }`}
                    >
                      <span>👗</span>
                      <span>Fashion Boutique</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusinessType('crafts')}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        businessType === 'crafts'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-neutral-200 bg-stone-50/50 text-neutral-600'
                      }`}
                    >
                      <span>🎁</span>
                      <span>Handmade & Gifts</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusinessType('general')}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        businessType === 'general'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-neutral-200 bg-stone-50/50 text-neutral-600'
                      }`}
                    >
                      <span>🛍️</span>
                      <span>General Store</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* WhatsApp Phone Number */}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98490 12345"
                  className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Customer orders will be routed straight to this WhatsApp number.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>{mode === 'register' ? 'Create My Menu & Launch' : 'Enter Merchant Studio'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant free setup · No password needed · Zero commissions</span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
