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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Transaction Verified!</h1>
          <p className="text-gray-400 text-sm">The product has been marked as SOLD</p>
        </div>

        {/* Receipt Card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,20,35,0.95))',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 40px rgba(139,92,246,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-700/50">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold text-sm tracking-wide uppercase">
              Digital Receipt
            </span>
            <span className="ml-auto text-xs text-gray-500">#{order.orderId}</span>
          </div>

          <div className="space-y-4">
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

          <div className="mt-5 pt-4 border-t border-gray-700/50 flex items-center justify-between">
            <span
              className="text-xs px-3 py-1 rounded-full font-bold tracking-wider"
              style={{
                background: 'rgba(34,197,94,0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
            >
              COMPLETED
            </span>
            <span className="text-xs text-gray-500">ZXAAA Marketplace</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff',
            }}
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={resetScanner}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#d1d5db',
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Scan Another
          </button>
        </div>
      </div>
    );
  }

  // ─── SCANNER VIEW ─────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">QR Verification & Generator</h1>
            <p className="text-xs text-gray-400">
              Scan buyer codes or generate real high-res scannable QR codes
            </p>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-[var(--color-zxaaa-border)]">
        <button
          onClick={() => setActiveMode('scan')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'scan'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white'
          }`}
        >
          <Camera size={15} /> Scan QR Code
        </button>
        <button
          onClick={() => setActiveMode('generate')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'generate'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white'
          }`}
        >
          <QrIcon size={15} /> Generate Real QR
        </button>
      </div>

      {/* GENERATE MODE PANEL */}
      {activeMode === 'generate' ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl border border-[var(--color-zxaaa-border)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" /> Real QR Code Generator
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                QR Code Text / Reference Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={genText}
                  onChange={(e) => setGenText(e.target.value)}
                  placeholder="Enter order reference or custom text"
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-mono text-white bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => setGenText('ZX-TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase())}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all shrink-0"
                >
                  New Random
                </button>
              </div>
            </div>
          </div>

          <RealQRCode 
            value={genText || 'ZX-TXN-DEMO'}
            title="Real Scannable QR Code"
            subtitle="Scan using any phone camera or the ZXAAA scanner tab"
          />
        </div>
      ) : (
        <>

      {/* Error Banner */}
      {verifyResult && !verifyResult.success && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-5 animate-fadeIn"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-red-300 text-sm font-semibold">Verification Failed</p>
            <p className="text-red-400/80 text-xs mt-0.5">{verifyResult.message}</p>
          </div>
          <button
            onClick={resetScanner}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Camera Scanner */}
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,20,35,0.95))',
          border: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '0 0 30px rgba(139,92,246,0.06)',
        }}
      >
        <div className="p-4 border-b border-gray-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-gray-200">Camera Scanner</span>
          </div>
          {isScanning && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Active
            </span>
          )}
        </div>

        <div className="relative">
          {/* Scanner render target */}
          <div
            id={SCANNER_ELEMENT_ID}
            className="w-full"
            style={{ minHeight: isScanning ? '300px' : '0', background: '#0a0a14' }}
          />

          {/* Placeholder when not scanning */}
          {!isScanning && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              {cameraAvailable ? (
                <>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(139,92,246,0.12)' }}
                  >
                    <Camera className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-300 text-sm mb-1 font-medium">
                    Ready to scan
                  </p>
                  <p className="text-gray-500 text-xs mb-5">
                    Position the QR code within the camera frame
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(239,68,68,0.12)' }}
                  >
                    <CameraOff className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-gray-300 text-sm mb-1 font-medium">
                    Camera unavailable
                  </p>
                  <p className="text-gray-500 text-xs mb-5">
                    {cameraError || 'Grant camera permission or use manual entry below'}
                  </p>
                </>
              )}
              <button
                onClick={startScanner}
                disabled={!cameraAvailable || verifying}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: cameraAvailable
                    ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                    : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                }}
              >
                {cameraAvailable ? 'Start Camera' : 'Camera Not Found'}
              </button>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="p-3 flex justify-center">
            <button
              onClick={stopScanner}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'rgba(239,68,68,0.12)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              Stop Camera
            </button>
          </div>
        )}
      </div>

      {/* Manual Fallback */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,20,35,0.95))',
          border: '1px solid rgba(139,92,246,0.15)',
        }}
      >
        <button
          onClick={() => setShowManual(!showManual)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-gray-200">
              Manual QR Reference Entry
            </span>
          </div>
          <span
            className="text-gray-500 text-xs transition-transform duration-200"
            style={{ transform: showManual ? 'rotate(180deg)' : 'none' }}
          >
            ▼
          </span>
        </button>

        {showManual && (
          <form onSubmit={handleManualSubmit} className="px-4 pb-4 animate-fadeIn">
            <p className="text-xs text-gray-500 mb-3">
              If the camera is not available, enter the QR reference code printed below
              the buyer's QR code (e.g. <code className="text-purple-400">ZX-TXN-A1B2C3D4</code>).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                placeholder="ZX-TXN-XXXXXXXX"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <button
                type="submit"
                disabled={verifying || !manualRef.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: '#fff',
                }}
              >
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Verify
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Loading overlay */}
      {verifying && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div
            className="rounded-2xl p-8 flex flex-col items-center gap-4"
            style={{
              background: 'rgba(20,20,35,0.98)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            <p className="text-gray-200 font-medium">Verifying transaction...</p>
            <p className="text-gray-500 text-xs">Please wait while we validate</p>
          </div>
        </div>
      )}
      </>
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
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <span
      className={`text-sm font-medium ${
        highlight ? 'text-green-400' : 'text-gray-200'
      }`}
    >
      {value}
    </span>
  </div>
);

export default ScanQR;
