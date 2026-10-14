import React from 'react';
import {
  Store,
  QrCode,
  Smartphone,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  ShoppingBag,
  ExternalLink,
  Zap,
  Phone,
  Printer
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'register' | 'login') => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onViewDemo }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              Q
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 text-lg tracking-tight">
                OrderDrop
              </span>
              <span className="text-[10px] text-neutral-400 font-bold ml-1.5 hidden sm:inline">
                by QuickMenu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onViewDemo}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <span>Explore Live Demo</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-4 py-1.5 rounded-xl text-neutral-700 hover:text-neutral-900 font-bold text-xs transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Create Free Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-neutral-200 bg-gradient-to-b from-white to-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Built for Indian Food Businesses, Home Bakers & Cloud Kitchens</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Turn your Instagram bio & dining tables into a{' '}
            <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">
              WhatsApp Food Menu
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Create an appetizing visual digital menu in 60 seconds. Customers browse your dishes, add to cart, and send completed orders with delivery address directly to your WhatsApp.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              <span>Create Your Restaurant Menu</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={onViewDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-sm sm:text-base transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>See Customer Menu Demo</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-neutral-500 font-medium pt-3">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>100% Commission-Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Direct WhatsApp Routing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Free Counter QR Standee</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Flow Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
            How It Works For You & Your Customers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Add Your Dishes & Prices</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enter your restaurant name, WhatsApp number, and upload or select delicious photos with Indian Veg/Non-Veg indicators.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Get Your Link & QR Standee</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We generate a custom link for your Instagram bio and a high-resolution QR code ready to print for dining tables and counters.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Receive Orders on WhatsApp</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Customers pick their food and tap "Place Order". A formatted bill with customer address and total arrives directly in your WhatsApp!
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 bg-white border-t border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900">Direct WhatsApp Orders</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Zero third-party commission. Every order lands straight in your personal WhatsApp chat.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900">Counter QR Standees</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                1-click print ready tent cards for billing counters, dining tables, and delivery boxes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900">Instant UPI Deep-Links</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Attach your UPI ID so customers can pay directly with GPay, PhonePe, or Paytm.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900">Multi-Category Support</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Works for Bakeries, Cloud Kitchens, Cafes, Thrift Boutiques, and Handmade Gift creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-gradient-to-br from-emerald-800 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to launch your digital menu?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
            Join hundreds of small food businesses, home bakers, and cloud kitchens in India taking direct orders on WhatsApp.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="px-8 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-extrabold text-sm sm:text-base shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-emerald-800" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
        <p>© 2026 OrderDrop by QuickMenu. Built with passion for small businesses in India.</p>
      </footer>
    </div>
  );
};
