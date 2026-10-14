import React from 'react';

interface VegBadgeProps {
  isVeg: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVeg, size = 'sm', showLabel = false }) => {
  const boxDim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const dotDim = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  if (isVeg) {
    return (
      <span className="inline-flex items-center gap-1.5" title="Pure Vegetarian">
        <span
          className={`${boxDim} border border-emerald-600 rounded-xs flex items-center justify-center p-0.5 bg-emerald-50/50 flex-shrink-0`}
          aria-label="Vegetarian"
        >
          <span className={`${dotDim} rounded-full bg-emerald-600`} />
        </span>
        {showLabel && <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Veg</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5" title="Non-Vegetarian">
      <span
        className={`${boxDim} border border-rose-600 rounded-xs flex items-center justify-center p-0.5 bg-rose-50/50 flex-shrink-0`}
        aria-label="Non-Vegetarian"
      >
        <span
          className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-rose-600"
        />
      </span>
      {showLabel && <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Non-Veg</span>}
    </span>
  );
};
