import { X, Search, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';

const HowItWorksModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-3xl p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(25, 25, 45, 0.98), rgba(15, 15, 30, 0.98))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30 uppercase tracking-wider inline-block mb-3">
            ZXAAA Marketplace Guide
          </span>
          <h2 className="text-3xl font-extrabold text-white gradient-text mb-2">
            How ZXAAA Works
          </h2>
          <p className="text-sm text-[var(--color-zxaaa-muted)] max-w-md mx-auto">
            Safe, verified local buy, sell, and swap in 3 simple steps
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="space-y-4 mb-8">
          {/* Step 1 */}
          <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] flex items-start gap-4 hover:border-[var(--color-zxaaa-purple)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                  Step 1
                </span>
                <h3 className="text-base font-bold text-white">
                  Discover Local Listings & Swaps
                </h3>
              </div>
              <p className="text-xs text-[var(--color-zxaaa-muted)] leading-relaxed">
                Browse products in your city or use the location selector to set a custom radius. Reserve item with "Buy Now" or propose an item exchange via "Swap Center".
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] flex items-start gap-4 hover:border-[var(--color-zxaaa-purple)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shrink-0 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                  Step 2
                </span>
                <h3 className="text-base font-bold text-white">
                  Meet & Inspect Physically
                </h3>
              </div>
              <p className="text-xs text-[var(--color-zxaaa-muted)] leading-relaxed">
                Chat securely in-app with the seller. Arrange a meeting in a safe public spot to inspect the item in person before making any payment.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 md:p-5 rounded-2xl bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] flex items-start gap-4 hover:border-[var(--color-zxaaa-purple)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Step 3
                </span>
                <h3 className="text-base font-bold text-white">
                  Scan QR Verification & Instant Receipt
                </h3>
              </div>
              <p className="text-xs text-[var(--color-zxaaa-muted)] leading-relaxed">
                Show your digital QR code (or manual code <code className="text-purple-400 font-mono">ZX-TXN-...</code>) to the seller. The seller scans it using "Scan QR" to instantly mark the product as SOLD and issue a verified digital receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)] text-sm flex items-center justify-center gap-2"
          >
            <span>Got It, Let's Explore</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;
