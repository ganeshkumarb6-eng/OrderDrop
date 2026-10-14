import { useState, useEffect } from 'react';
import { StoreProfile, MerchantUser, BusinessType } from './types';
import { DEFAULT_STORES } from './data/defaultStores';
import {
  getAllStores,
  saveOrUpdateStore,
  decodeStoreFromUrl,
} from './utils/storage';
import {
  getCurrentUser,
  logoutUser,
  getStoresForUser,
  createNewStoreForUser,
} from './utils/auth';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { CustomerMenu } from './components/customer/CustomerMenu';
import { LandingPage } from './components/landing/LandingPage';
import { MerchantAuthModal } from './components/auth/MerchantAuthModal';
import { Store, Smartphone, Globe } from 'lucide-react';

export default function App() {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [currentStore, setCurrentStore] = useState<StoreProfile>(DEFAULT_STORES[0]);
  const [currentUser, setCurrentUser] = useState<MerchantUser | null>(null);
  const [activeView, setActiveView] = useState<'landing' | 'merchant' | 'customer'>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login'>('register');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize store and check URL parameters on mount
  useEffect(() => {
    const loadedStores = getAllStores();
    setStores(loadedStores);

    const user = getCurrentUser();
    setCurrentUser(user);

    // Parse URL params
    const searchParams = new URLSearchParams(window.location.search);
    const menuParam = searchParams.get('menu');
    const storeDataParam = searchParams.get('storeData');
    const hash = window.location.hash;

    // Check if storeData (compressed portable store) is in URL
    if (storeDataParam) {
      const decoded = decodeStoreFromUrl(storeDataParam);
      if (decoded) {
        saveOrUpdateStore(decoded);
        setCurrentStore(decoded);
        setActiveView('customer');
        setIsLoading(false);
        return;
      }
    }

    // Check if ?menu=slug or #menu/slug is in URL (Customer flow)
    let targetSlug: string | null = null;
    if (menuParam) {
      targetSlug = menuParam;
    } else if (hash.startsWith('#/menu/')) {
      targetSlug = hash.replace('#/menu/', '');
    } else if (hash.startsWith('#menu/')) {
      targetSlug = hash.replace('#menu/', '');
    }

    if (targetSlug) {
      const matched = loadedStores.find((s) => s.slug === targetSlug || s.id === targetSlug);
      if (matched) {
        setCurrentStore(matched);
      } else {
        const fallback = { ...DEFAULT_STORES[0], slug: targetSlug };
        setCurrentStore(fallback);
      }
      setActiveView('customer');
    } else if (user) {
      // User is already logged in as a merchant -> load their store and go to Merchant Studio
      const userStores = getStoresForUser(user, loadedStores);
      setCurrentStore(userStores[0] || DEFAULT_STORES[0]);
      setActiveView('merchant');
    } else {
      // Public homepage for visitors
      setActiveView('landing');
    }

    setIsLoading(false);
  }, []);

  // Update store handler
  const handleUpdateStore = (updated: StoreProfile) => {
    setCurrentStore(updated);
    saveOrUpdateStore(updated);
    setStores(getAllStores());
  };

  // Auth success handler (when merchant logs in or registers)
  const handleAuthSuccess = (
    user: MerchantUser,
    businessType: BusinessType = 'food',
    storeName?: string
  ) => {
    setCurrentUser(user);

    const loadedStores = getAllStores();
    let userStores = loadedStores.filter((s) => s.ownerId === user.id);

    if (userStores.length === 0) {
      // Create new store for this merchant
      const newStore = createNewStoreForUser(
        user,
        storeName || `${user.name}'s ${businessType === 'food' ? 'Kitchen' : 'Store'}`,
        businessType,
        user.phone
      );
      saveOrUpdateStore(newStore);
      setStores(getAllStores());
      setCurrentStore(newStore);
    } else {
      setCurrentStore(userStores[0]);
    }

    setActiveView('merchant');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveView('landing');
  };

  const handleOpenAuth = (mode: 'register' | 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Compute clean public shareable URL for the current store
  const baseUrl = window.location.origin + window.location.pathname;
  const publicLiveUrl = `${baseUrl}?menu=${currentStore.slug}`;

  // Get stores belonging to current merchant
  const merchantStores = currentUser ? stores.filter((s) => s.ownerId === currentUser.id) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-neutral-600">Loading OrderDrop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-neutral-50 text-neutral-900">
      {/* Floating View Switcher for Testing */}
      <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1 p-1 bg-neutral-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-700/80 text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveView('landing');
            window.history.replaceState({}, '', baseUrl);
          }}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
            activeView === 'landing'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Home Landing Page"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              handleOpenAuth('login');
            } else {
              setActiveView('merchant');
              window.history.replaceState({}, '', baseUrl);
            }
          }}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
            activeView === 'merchant'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Merchant Dashboard"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Merchant Studio</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveView('customer');
            window.history.replaceState({}, '', `${baseUrl}?menu=${currentStore.slug}`);
          }}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
            activeView === 'customer'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Customer Food Menu"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Customer Menu</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeView === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onViewDemo={() => {
            setCurrentStore(DEFAULT_STORES[0]);
            setActiveView('customer');
            window.history.replaceState({}, '', `${baseUrl}?menu=hyderabad-bakes`);
          }}
        />
      ) : activeView === 'merchant' ? (
        <MerchantDashboard
          store={currentStore}
          onUpdateStore={handleUpdateStore}
          onOpenCustomerView={() => {
            setActiveView('customer');
            window.history.replaceState({}, '', `${baseUrl}?menu=${currentStore.slug}`);
          }}
          publicUrl={publicLiveUrl}
          user={currentUser}
          onLogout={handleLogout}
          userStores={merchantStores.length > 0 ? merchantStores : [currentStore]}
          onSelectStore={(st) => setCurrentStore(st)}
        />
      ) : (
        <CustomerMenu
          store={currentStore}
          onSwitchToMerchant={() => {
            if (currentUser) {
              setActiveView('merchant');
            } else {
              setActiveView('landing');
            }
            window.history.replaceState({}, '', baseUrl);
          }}
        />
      )}

      {/* Login & Registration Modal */}
      <MerchantAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultMode={authModalMode}
      />
    </div>
  );
}
