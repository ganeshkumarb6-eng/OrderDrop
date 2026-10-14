import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Upload, Check, Sparkles } from 'lucide-react';
import { MenuItem, BusinessType } from '../../types';
import { PRESET_IMAGES } from '../../data/presetImages';
import { VegBadge } from '../common/VegBadge';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  itemToEdit: MenuItem | null;
  currency: string;
  businessType: BusinessType;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  currency,
  businessType,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [allowCustomNote, setAllowCustomNote] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  const getCategoriesForType = (type: BusinessType): string[] => {
    switch (type) {
      case 'fashion':
        return ['Ethnic Wear', 'Western & Streetwear', 'Thrift & Outerwear', 'Jewelry & Accessories', 'Footwear', 'Bags', 'Other'];
      case 'crafts':
        return ['Scented Candles', 'Resin Art', 'Gift Hampers', 'Personalized Gifts', 'Home Decor', 'Other'];
      case 'general':
        return ['Featured', 'Best Sellers', 'New Arrivals', 'Essentials', 'Other'];
      case 'food':
      default:
        return ['Bakery & Desserts', 'Cakes', 'Pastries', 'Main Course', 'Starters', 'Snacks', 'Beverages', 'Other'];
    }
  };

  const categories = getCategoriesForType(businessType);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setPrice(itemToEdit.price);
      setDescription(itemToEdit.description);
      if (categories.includes(itemToEdit.category)) {
        setCategory(itemToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(itemToEdit.category);
      }
      setImageUrl(itemToEdit.imageUrl);
      setIsVeg(itemToEdit.isVeg ?? true);
      setIsAvailable(itemToEdit.isAvailable);
      setBestseller(!!itemToEdit.bestseller);
      setSizes(itemToEdit.sizes || []);
      setAllowCustomNote(!!itemToEdit.allowCustomNote);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCategory(categories[0] || 'General');
      setCustomCategory('');
      // Find matching preset image
      const matchingPreset = PRESET_IMAGES.find((p) => p.businessType === businessType);
      setImageUrl(matchingPreset?.url || PRESET_IMAGES[0].url);
      setIsVeg(true);
      setIsAvailable(true);
      setBestseller(false);
      setSizes(businessType === 'fashion' ? ['S', 'M', 'L'] : []);
      setAllowCustomNote(businessType === 'crafts');
    }
    setErrors({});
  }, [itemToEdit, isOpen, businessType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSize = (sizeOption: string) => {
    setSizes((prev) =>
      prev.includes(sizeOption) ? prev.filter((s) => s !== sizeOption) : [...prev, sizeOption]
    );
  };

  const validate = () => {
    const newErrors: { name?: string; price?: string } = {};
    if (!name.trim()) newErrors.name = 'Item name is required';
    if (price === '' || Number(price) < 0) newErrors.price = 'Valid price is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    const newItem: MenuItem = {
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      category: finalCategory || 'General',
      imageUrl:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      isAvailable,
      bestseller,
      ...(businessType === 'food' ? { isVeg } : {}),
      ...(businessType === 'fashion' && sizes.length > 0 ? { sizes } : {}),
      ...(businessType === 'crafts' ? { allowCustomNote } : {}),
    };

    onSave(newItem);
    onClose();
  };

  const relevantPresets = PRESET_IMAGES.filter(
    (p) => p.businessType === businessType || businessType === 'general'
  );

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

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-stone-50/70">
            <div>
              <h3 className="font-extrabold text-neutral-900 text-lg leading-tight">
                {itemToEdit ? 'Edit Item' : 'Add New Item / Product'}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                {businessType === 'food' && 'Add appetizing dishes to your digital menu'}
                {businessType === 'fashion' && 'Add garments, apparel, or jewelry with sizes'}
                {businessType === 'crafts' && 'Add handmade products, candles, or custom gifts'}
                {businessType === 'general' && 'Add products to your digital catalog'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-200/70 text-neutral-600 flex items-center justify-center hover:bg-neutral-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form id="menu-item-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {businessType === 'food' ? 'Dish Name' : 'Product / Item Name'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder={
                  businessType === 'food'
                    ? 'e.g. Belgian Dark Chocolate Truffle Cake'
                    : businessType === 'fashion'
                    ? 'e.g. Indigo Hand-Block Chanderi Kurti'
                    : 'e.g. French Vanilla Scented Soy Candle'
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-200'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Price ({currency}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value === '' ? '' : Number(e.target.value));
                      if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    placeholder="499"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm font-semibold text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      errors.price ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-200'
                    }`}
                  />
                </div>
                {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {category === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Custom Category Name</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Traditional Sweets, Accessories"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            )}

            {/* FASHION ONLY: Size / Variant Options */}
            {businessType === 'fashion' && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-neutral-200 space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Available Sizes / Variants
                </label>
                <p className="text-[11px] text-neutral-500">Select sizes customers can choose from:</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableSizes.map((sz) => {
                    const isSelected = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CRAFTS ONLY: Custom Engraving / Gifting Note Toggle */}
            {businessType === 'crafts' && (
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-neutral-200">
                <div>
                  <p className="text-xs font-bold text-neutral-800">Allow Customization / Gift Message</p>
                  <p className="text-[11px] text-neutral-500">
                    Customer can type a personalized name, engraving, or message note
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowCustomNote}
                  onChange={(e) => setAllowCustomNote(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            )}

            {/* FOOD ONLY: Veg / Non-Veg Indicator */}
            {businessType === 'food' && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-neutral-200">
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Dietary Indicator (Standard India)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVeg(true)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isVeg ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <VegBadge isVeg={true} size="sm" />
                    Pure Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVeg(false)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      !isVeg ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-2xs' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <VegBadge isVeg={false} size="sm" />
                    Non-Vegetarian
                  </button>
                </div>
              </div>
            )}

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Short Description / Key Highlights
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fabric, materials, portions, flavor profile, or dispatch notes..."
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />
            </div>

            {/* Bestseller & Availability Toggles */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-neutral-200">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Highlight</label>
                <button
                  type="button"
                  onClick={() => setBestseller(!bestseller)}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    bestseller ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-white border-neutral-200 text-neutral-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {bestseller ? '★ Best Seller' : 'Standard'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Stock Status</label>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isAvailable ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-neutral-200 border-neutral-300 text-neutral-600'
                  }`}
                >
                  {isAvailable ? '✓ In Stock' : 'Sold Out'}
                </button>
              </div>
            </div>

            {/* Image Selection & Gallery */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-700">Photo / Image</label>
                <button
                  type="button"
                  onClick={() => setShowPresetPicker(!showPresetPicker)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  {showPresetPicker ? 'Hide Gallery' : 'Pick from Curated Photos'}
                </button>
              </div>

              {/* Gallery dropdown */}
              {showPresetPicker && (
                <div className="mb-3 p-3 bg-neutral-100 rounded-2xl border border-neutral-200">
                  <p className="text-[11px] font-bold text-neutral-500 mb-2">
                    Click any high-definition photo:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto pr-1">
                    {relevantPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          setShowPresetPicker(false);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                          imageUrl === preset.url ? 'border-emerald-600 scale-95 shadow-sm' : 'border-transparent hover:opacity-80'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        {imageUrl === preset.url && (
                          <div className="absolute inset-0 bg-emerald-700/40 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* URL or Upload */}
              <div className="flex gap-2.5 items-center">
                <div className="w-14 h-14 rounded-2xl border border-neutral-200 overflow-hidden flex-shrink-0 bg-neutral-100">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <ImageIcon className="w-6 h-6 stroke-1" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image link or upload"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <label className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-emerald-700 font-bold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload photo from device</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </form>

          {/* Footer CTA */}
          <div className="p-4 border-t border-neutral-100 bg-stone-50/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-200/50 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="menu-item-form"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              {itemToEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
