import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Copy, Check, ExternalLink, X, ArrowLeft } from 'lucide-react';
import { OrderCustomerInfo, StoreProfile } from '../../types';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    customer: OrderCustomerInfo;
    messageText: string;
    whatsappUrl: string;
  } | null;
  store: StoreProfile;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderDetails,
  store,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !orderDetails) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderDetails.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenAgain = () => {
    window.open(orderDetails.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Order Routing to WhatsApp!</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Your cart has been compiled into a WhatsApp message for <strong className="text-neutral-700">{store.businessName}</strong> ({store.whatsappNumber}).
            </p>
          </div>

          {/* Formatted Message Preview */}
          <div className="mt-4 bg-neutral-50 rounded-xl p-3.5 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                WhatsApp Message Payload
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            <pre className="text-xs font-mono text-neutral-700 whitespace-pre-wrap max-h-44 overflow-y-auto bg-white p-2.5 rounded-lg border border-neutral-100 selection:bg-emerald-100">
              {orderDetails.messageText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2.5">
            <a
              href={orderDetails.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Open WhatsApp Chat
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Food Menu
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
