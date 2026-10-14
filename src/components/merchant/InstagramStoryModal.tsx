import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Sparkles, Smartphone, ArrowDown } from 'lucide-react';
import QRCode from 'qrcode';
import { StoreProfile } from '../../types';

interface InstagramStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreProfile;
  publicUrl: string;
}

export const InstagramStoryModal: React.FC<InstagramStoryModalProps> = ({
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
          width: 220,
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

  const handleDownloadStory = () => {
    // Generate a high-res 1080x1920 Instagram Story Canvas
    const storyCanvas = document.createElement('canvas');
    storyCanvas.width = 1080;
    storyCanvas.height = 1920;
    const ctx = storyCanvas.getContext('2d');
    if (!ctx) return;

    // Gradient Background (Deep emerald luxury theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#064e3b');
    gradient.addColorStop(0.5, '#065f46');
    gradient.addColorStop(1, '#022c22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Accent pattern circles
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.beginPath();
    ctx.arc(540, 400, 500, 0, Math.PI * 2);
    ctx.fill();

    // Top Brand Tag
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍔 ORDER DIRECT VIA WHATSAPP', 540, 260);

    // Business Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 78px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(store.businessName, 540, 360);

    // Tagline
    if (store.tagline) {
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '400 38px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(store.tagline, 540, 430);
    }

    // QR Code Container Box
    ctx.fillStyle = '#ffffff';
    ctx.roundRect ? ctx.roundRect(240, 560, 600, 680, 48) : ctx.fillRect(240, 560, 600, 680);
    ctx.fill();

    // Draw QR Code in center
    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 320, 640, 440, 440);
    }

    // Scan Label below QR
    ctx.fillStyle = '#064e3b';
    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SCAN WITH CAMERA', 540, 1150);

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('To browse our live visual food menu', 540, 1195);

    // Feature Badges at Bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.roundRect ? ctx.roundRect(140, 1340, 800, 280, 36) : ctx.fillRect(140, 1340, 800, 280);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✨ Freshly Prepared · Direct to Kitchen', 540, 1420);

    ctx.fillStyle = '#34d399';
    ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`WhatsApp: ${store.whatsappNumber}`, 540, 1490);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '400 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Tap Link in Bio or Scan to Order', 540, 1550);

    // Bottom Branding
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Powered by QuickMenu', 540, 1780);

    // Trigger Download
    const dataUrl = storyCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${store.slug}-instagram-story.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          className="fixed inset-0 bg-neutral-900/70 backdrop-blur-xs"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-extrabold text-neutral-900">
            Instagram Story & WhatsApp Flyer
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            Ready-to-post 9:16 vertical graphic for your Instagram Story, WhatsApp Status, and packaging!
          </p>

          {/* 9:16 Story Preview Card */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-lg max-w-[240px] mx-auto border border-emerald-700/50">
            <span className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-widest block">
              ORDER ON WHATSAPP
            </span>
            <h4 className="text-sm font-black mt-1 truncate">{store.businessName}</h4>
            <p className="text-[10px] text-emerald-200 truncate">{store.tagline || 'Visual Food Menu'}</p>

            <div className="my-3 p-2 bg-white rounded-xl shadow-xs inline-block">
              <canvas ref={canvasRef} className="mx-auto w-32 h-32" />
            </div>

            <p className="text-[10px] font-bold text-white">SCAN TO ORDER</p>
            <p className="text-[9px] text-emerald-200 mt-0.5">{store.whatsappNumber}</p>
          </div>

          {/* Download Action */}
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={handleDownloadStory}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Instagram Story Poster (PNG)
            </button>
            <p className="text-[11px] text-neutral-400">
              💡 Tip: Post this on your Instagram story with the link sticker pointing to your menu!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
