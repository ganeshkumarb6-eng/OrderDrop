import { useState, useEffect } from 'react';
import { StoreProfile } from './types';
import { DEFAULT_STORES } from './data/defaultStores';
import {
  getAllStores,
  saveOrUpdateStore,
  decodeStoreFromUrl,
} from './utils/storage';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { CustomerMenu } from './components/customer/CustomerMenu';
import { Store, Smartphone } from 'lucide-react';

export default function App() {
  const [, setStores] = useState<StoreProfile[]>([]);
  const [currentStore, setCurrentStore] = useState<StoreProfile>(DEFAULT_STORES[0]);
  const [activeView, setActiveView] = useState<'merchant' | 'customer'>('merchant');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize store and check URL parameters on mount
  useEffect(() => {
    const loadedStores = getAllStores();
    setStores(loadedStores);

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

    // Check if ?menu=slug or #menu/slug is in URL
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
    } else {
      setCurrentStore(loadedStores[0] || DEFAULT_STORES[0]);
      setActiveView('merchant');
    }

    setIsLoading(false);
  }, []);

  // Update store handler
  const handleUpdateStore = (updated: StoreProfile) => {
    setCurrentStore(updated);
    saveOrUpdateStore(updated);
    setStores(getAllStores());
  };

  // Compute clean public shareable URL for the current store
  const baseUrl = window.location.origin + window.location.pathname;
  const publicLiveUrl = `${baseUrl}?menu=${currentStore.slug}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-neutral-600">Loading QuickMenu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-neutral-50 text-neutral-900">
      {/* Floating View Switcher: Easy instant testing between Merchant Studio and Customer Food Menu */}
      <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1 p-1 bg-neutral-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-700/80 text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveView('merchant');
            window.history.replaceState({}, '', baseUrl);
          }}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'merchant'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Merchant Builder</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveView('customer');
            window.history.replaceState({}, '', `${baseUrl}?menu=${currentStore.slug}`);
          }}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'customer'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Customer Menu</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeView === 'merchant' ? (
        <MerchantDashboard
          store={currentStore}
          onUpdateStore={handleUpdateStore}
          onOpenCustomerView={() => {
            setActiveView('customer');
            window.history.replaceState({}, '', `${baseUrl}?menu=${currentStore.slug}`);
          }}
          publicUrl={publicLiveUrl}
        />
      ) : (
        <CustomerMenu
          store={currentStore}
          onSwitchToMerchant={() => {
            setActiveView('merchant');
            window.history.replaceState({}, '', baseUrl);
          }}
        />
      )}
    </div>
  );
}
