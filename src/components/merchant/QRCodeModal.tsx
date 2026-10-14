import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Copy, Check, ExternalLink, Printer, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { StoreProfile } from '../../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreProfile;
  publicUrl: string;
  onOpenStandee: () => void;
  onOpenCustomerView: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  store,
  publicUrl,
  onOpenStandee,
  onOpenCustomerView,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && publicUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        publicUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#064e3b', // Deep emerald
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) {
            console.error('QR code generation error:', error);
          } else {
            setQrGenerated(true);
          }
        }
      );
    }
  }, [isOpen, publicUrl]);

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickmenu-${store.slug}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-6 text-center"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <QrIcon className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-neutral-900 leading-tight">
            Live Store Link & QR Code
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            Place this QR code on dining tables, packaging boxes, delivery bags, or your Instagram bio!
          </p>

          {/* QR Code Canvas Card */}
          <div className="mt-5 p-4 bg-gradient-to-b from-emerald-50/50 to-neutral-50 rounded-2xl border border-emerald-100/80 inline-block shadow-sm">
            <div className="bg-white p-3 rounded-xl shadow-xs border border-neutral-100">
              <canvas ref={canvasRef} className="mx-auto rounded-lg max-w-full h-auto" />
            </div>
            <p className="text-xs font-bold text-emerald-900 mt-2.5">{store.businessName}</p>
            <p className="text-[10px] text-neutral-500">Scan with any phone camera to view & order</p>
          </div>

          {/* Routing Link Box */}
          <div className="mt-4 flex items-center gap-1.5 p-2 bg-neutral-100 rounded-xl border border-neutral-200 text-left">
            <span className="text-xs font-mono text-neutral-600 truncate flex-1 px-2 select-all">
              {publicUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs border border-neutral-200 shadow-2xs flex items-center gap-1 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download QR (PNG)
            </button>

            <button
              type="button"
              onClick={onOpenStandee}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Table Standee / Flyer
            </button>
          </div>

          {/* Secondary preview trigger */}
          <div className="mt-3">
            <button
              type="button"
              onClick={onOpenCustomerView}
              className="w-full py-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live Customer Menu in New Tab
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
