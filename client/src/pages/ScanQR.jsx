import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import useQRScanner from '../hooks/useQRScanner';
import axios from 'axios';
import RealQRCode from '../components/RealQRCode';
import {
  ScanLine,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Keyboard,
  Loader2,
  ShieldCheck,
  Printer,
  RotateCcw,
  Package,
  User,
  CreditCard,
  Calendar,
  Hash,
  QrCode as QrIcon,
  Sparkles,
} from 'lucide-react';

const SCANNER_ELEMENT_ID = 'qr-reader-box';

const ScanQR = () => {
  const { user } = useAuth();
  const [manualRef, setManualRef] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); // { success, message, data }
  const [verifying, setVerifying] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [activeMode, setActiveMode] = useState('scan'); // 'scan' | 'generate'
  const [genText, setGenText] = useState('ZX-TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase());

  // Handle decoded QR text
  const handleQRDecode = useCallback(
    async (decodedText) => {
      if (verifying) return;
      await verifyQR(decodedText.trim());
    },
    // eslint-disable-next-line
    []
  );

  const {
    isScanning,
    startScanner,
    stopScanner,
    error: cameraError,
    cameraAvailable,
  } = useQRScanner(SCANNER_ELEMENT_ID, handleQRDecode);

  // Call backend to verify QR
  const verifyQR = async (qrReference) => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const token = user?.token;
      const { data } = await axios.post(
        'http://localhost:5000/api/orders/verify-qr',
        { qrReference },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVerifyResult({ success: true, message: data.message, data: data.data });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Verification failed. Please try again.';
      setVerifyResult({ success: false, message: msg, data: null });
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualRef.trim()) return;
    verifyQR(manualRef.trim());
  };

  const resetScanner = () => {
    setVerifyResult(null);
    setManualRef('');
    setShowManual(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // ─── RECEIPT VIEW ─────────────────────────────────────────────
  if (verifyResult?.success && verifyResult.data) {
    const order = verifyResult.data;
    return (
      <div className="max-w-lg mx-auto animate-fadeIn" id="scan-qr-receipt">
        {/* Success Header */}
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 border-4 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Transaction Verified!</h1>
          <p className="text-[var(--color-zxaaa-muted)] font-bold">The product has been successfully transferred.</p>
        </div>

        {/* Receipt Card */}
        <div
          className="rounded-[24px] p-8 mb-6 relative overflow-hidden"
          style={{
            background: 'var(--color-zxaaa-card)',
            border: '1px solid var(--color-zxaaa-primary-glow)',
            boxShadow: '0 0 40px var(--color-zxaaa-primary-glow)',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--color-zxaaa-primary)' }} />
          
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--color-zxaaa-border)]">
            <ShieldCheck className="w-6 h-6 text-[var(--color-zxaaa-primary)]" />
            <span className="text-white font-black tracking-wide uppercase">
              Digital Receipt
            </span>
            <span className="ml-auto text-xs font-bold text-[var(--color-zxaaa-muted)]">#{order.orderId}</span>
          </div>

          <div className="space-y-5">
            <ReceiptRow
              icon={<Package className="w-4 h-4" />}
              label="Product"
              value={order.product?.title || 'N/A'}
            />
            <ReceiptRow
              icon={<CreditCard className="w-4 h-4" />}
              label="Amount"
              value={`₹${order.amount?.toLocaleString('en-IN')}`}
              highlight
            />
            <ReceiptRow
              icon={<User className="w-4 h-4" />}
              label="Payment Method"
              value={order.paymentMethod || 'N/A'}
            />
            <ReceiptRow
              icon={<Hash className="w-4 h-4" />}
              label="QR Reference"
              value={order.qrReference}
            />
            <ReceiptRow
              icon={<Calendar className="w-4 h-4" />}
              label="Completed At"
              value={new Date().toLocaleString('en-IN')}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-zxaaa-border)] flex items-center justify-between">
            <span className="text-xs px-4 py-1.5 rounded-full font-black tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              COMPLETED
            </span>
            <span className="text-xs font-bold text-[var(--color-zxaaa-muted)]">ZXAAA Secure Pay</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Print Receipt
          </button>
          <button
            onClick={resetScanner}
            className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Scan Another
          </button>
        </div>
      </div>
    );
  }

  // ─── SCANNER VIEW ─────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-[var(--color-zxaaa-primary-bg)] border border-[var(--color-zxaaa-primary-glow)]">
          <ScanLine className="w-8 h-8 text-[var(--color-zxaaa-primary)]" />
        </div>
        <h1 className="text-3xl font-black text-white">QR Verification System</h1>
        <p className="text-[var(--color-zxaaa-muted)] mt-2">
          Scan buyer codes during meetup to verify transactions.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)] max-w-sm mx-auto mb-8">
        <button
          onClick={() => setActiveMode('scan')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'scan'
              ? 'bg-[var(--color-zxaaa-primary)] text-white shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white'
          }`}
        >
          <Camera size={16} /> Scan Mode
        </button>
        <button
          onClick={() => setActiveMode('generate')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'generate'
              ? 'bg-[var(--color-zxaaa-primary)] text-white shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white'
          }`}
        >
          <QrIcon size={16} /> Dev: Generate
        </button>
      </div>

      {/* GENERATE MODE PANEL */}
      {activeMode === 'generate' ? (
        <div className="space-y-6 animate-fadeIn max-w-sm mx-auto">
          <div className="p-6 rounded-2xl border border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-card)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-zxaaa-primary)]" /> Test QR Generator
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-[var(--color-zxaaa-muted)] mb-2">
                QR Reference Data
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={genText}
                  onChange={(e) => setGenText(e.target.value)}
                  placeholder="ZX-TXN-..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-mono text-white bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)]"
                />
                <button
                  onClick={() => setGenText('ZX-TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase())}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-zxaaa-text)] bg-[var(--color-zxaaa-primary-bg)] border border-[var(--color-zxaaa-primary-glow)] hover:bg-[var(--color-zxaaa-primary)] hover:text-white transition-colors shrink-0"
                >
                  Random
                </button>
              </div>
            </div>
          </div>

          <RealQRCode 
            value={genText || 'ZX-TXN-DEMO'}
            title="Dev QR Code"
            subtitle="Use this to test the scanner"
          />
        </div>
      ) : (
        <div className="space-y-6">

      {/* Error Banner */}
      {verifyResult && !verifyResult.success && (
        <div className="flex items-center gap-4 p-5 rounded-[16px] animate-fadeIn bg-red-500/10 border border-red-500/30">
          <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-bold">Verification Failed</p>
            <p className="text-red-300 text-xs mt-1 font-semibold">{verifyResult.message}</p>
          </div>
          <button
            onClick={resetScanner}
            className="ml-auto w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      )}

      {/* Camera Scanner */}
      <div className="rounded-[24px] overflow-hidden bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] shadow-xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-zxaaa-border)] z-10" />
        
        <div className="p-5 border-b border-[var(--color-zxaaa-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--color-zxaaa-muted)]" />
            <span className="text-sm font-bold text-white">Camera Viewfinder</span>
          </div>
          {isScanning && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Scanning
            </span>
          )}
        </div>

        <div className="relative">
          {/* Scanner render target */}
          <div
            id={SCANNER_ELEMENT_ID}
            className="w-full"
            style={{ minHeight: isScanning ? '350px' : '0', background: 'var(--color-zxaaa-bg)' }}
          />

          {/* Placeholder when not scanning */}
          {!isScanning && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              {cameraAvailable ? (
                <>
                  <div className="w-20 h-20 rounded-[20px] flex items-center justify-center mb-6 bg-[var(--color-zxaaa-primary-bg)] border border-[var(--color-zxaaa-primary-glow)] shadow-[0_0_20px_var(--color-zxaaa-primary-glow)]">
                    <Camera className="w-10 h-10 text-[var(--color-zxaaa-primary)]" />
                  </div>
                  <h3 className="text-white font-bold mb-2 text-lg">Scanner Ready</h3>
                  <p className="text-[var(--color-zxaaa-muted)] text-sm mb-8 text-center max-w-xs">
                    Position the buyer's QR code clearly within the camera frame to verify.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-[20px] flex items-center justify-center mb-6 bg-red-500/10 border border-red-500/30">
                    <CameraOff className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2 text-lg">Camera Unavailable</h3>
                  <p className="text-[var(--color-zxaaa-muted)] text-sm mb-8 text-center max-w-xs">
                    {cameraError || 'Please allow camera permissions or use manual entry.'}
                  </p>
                </>
              )}
              <button
                onClick={startScanner}
                disabled={!cameraAvailable || verifying}
                className="btn-primary px-8 py-3.5 text-sm"
              >
                {cameraAvailable ? 'Activate Camera' : 'Camera Not Found'}
              </button>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="p-4 border-t border-[var(--color-zxaaa-border)] flex justify-center bg-[var(--color-zxaaa-card)] relative z-10">
            <button
              onClick={stopScanner}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors"
            >
              Stop Camera
            </button>
          </div>
        )}
      </div>

      {/* Manual Fallback */}
      <div className="rounded-[20px] overflow-hidden bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)]">
        <button
          onClick={() => setShowManual(!showManual)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-[var(--color-zxaaa-bg)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] flex items-center justify-center">
               <Keyboard className="w-4 h-4 text-[var(--color-zxaaa-muted)]" />
            </div>
            <span className="text-sm font-bold text-white">Manual Reference Entry</span>
          </div>
          <span className={`text-[var(--color-zxaaa-muted)] transition-transform duration-300 ${showManual ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showManual && (
          <form onSubmit={handleManualSubmit} className="p-5 pt-0 border-t border-[var(--color-zxaaa-border)] mt-2">
            <p className="text-xs font-bold text-[var(--color-zxaaa-muted)] mb-4 mt-4">
              If scanning fails, enter the reference code printed below the QR code.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                placeholder="e.g. ZX-TXN-..."
                className="flex-1 px-4 py-3 rounded-xl text-sm font-mono text-white bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)]"
              />
              <button
                type="submit"
                disabled={verifying || !manualRef.trim()}
                className="btn-primary px-6 py-3 flex items-center gap-2"
              >
                {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Verify
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Loading overlay */}
      {verifying && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-[24px] p-10 flex flex-col items-center gap-5 bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-primary-glow)] shadow-[0_0_40px_var(--color-zxaaa-primary-glow)]">
            <Loader2 size={48} className="text-[var(--color-zxaaa-primary)] animate-spin" />
            <div className="text-center">
               <p className="text-xl font-black text-white">Verifying...</p>
               <p className="text-[var(--color-zxaaa-muted)] text-sm font-bold mt-1">Checking secure database</p>
            </div>
          </div>
        </div>
      )}
      </div>
      )}

      {/* Print-only styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @media print {
          body * { visibility: hidden; }
          #scan-qr-receipt, #scan-qr-receipt * { visibility: visible; }
          #scan-qr-receipt { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// Small receipt row component
const ReceiptRow = ({ icon, label, value, highlight }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-[var(--color-zxaaa-muted)]">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <span
      className={`text-sm font-black ${
        highlight ? 'text-[var(--color-zxaaa-primary)]' : 'text-white'
      }`}
    >
      {value}
    </span>
  </div>
);

export default ScanQR;
