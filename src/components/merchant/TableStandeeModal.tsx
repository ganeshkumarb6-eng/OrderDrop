import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Phone } from 'lucide-react';
import QRCode from 'qrcode';
import { StoreProfile } from '../../types';

interface TableStandeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreProfile;
  publicUrl: string;
}

export const TableStandeeModal: React.FC<TableStandeeModalProps> = ({
  isOpen,
  onClose,
  store,
  publicUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current && publicUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        publicUrl,
        {
          width: 260,
          margin: 1,
          color: {
            dark: '#064e3b',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        () => {}
      );
    }
  }, [isOpen, publicUrl]);

  const handlePrint = () => {
    window.print();
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
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs print:hidden"
        />

        {/* Modal / Standee Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-10 text-center border-4 border-emerald-600/90 print:shadow-none print:border-none print:p-2"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-colors print:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Standee Content */}
          <div className="py-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              QuickMenu · Scan & Order
            </span>

            <h2 className="text-2xl font-black text-neutral-900 mt-3 tracking-tight">
              {store.businessName}
            </h2>

            {store.tagline && (
              <p className="text-xs text-neutral-500 mt-1 max-w-[260px] mx-auto font-medium">
                {store.tagline}
              </p>
            )}

            {/* QR Code Container */}
            <div className="my-5 p-4 bg-emerald-50/60 rounded-2xl border-2 border-dashed border-emerald-300 inline-block">
              <div className="bg-white p-2 rounded-xl shadow-xs">
                <canvas ref={canvasRef} className="mx-auto" />
              </div>
              <p className="text-[11px] font-bold text-emerald-950 mt-2">
                Scan with any phone camera
              </p>
            </div>

            {/* Steps Guide */}
            <div className="bg-neutral-50 rounded-2xl p-3 text-left space-y-1.5 border border-neutral-100">
              <div className="flex items-start gap-2 text-xs text-neutral-700">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Open Camera on phone & scan QR code</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-700">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Browse visual menu & add items to cart</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-700">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Tap "Place Order" to message on WhatsApp</span>
              </div>
            </div>

            {/* WhatsApp Contact badge */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp: {store.whatsappNumber}</span>
            </div>
          </div>

          {/* Print Button (Hidden in print) */}
          <div className="mt-5 pt-3 border-t border-neutral-100 flex gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Table Standee
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
