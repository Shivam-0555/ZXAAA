import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import axios from 'axios';
import {
  QrCode, ShieldCheck, Copy, Check, ExternalLink, Clock,
  IndianRupee, Package, User as UserIcon, Hash, AlertCircle,
  Smartphone, Download, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

/**
 * UpiQRPanel — renders a real UPI payment QR for a given order.
 *
 * Security guarantees:
 *  - UPI ID is ALWAYS fetched live from the backend using the authenticated seller ID
 *  - Amount is ALWAYS taken from order.amount (set server-side from product.price)
 *  - No UPI PIN is collected, stored, or requested here
 *  - Payment is completed externally in the user's UPI app
 *  - Order is NEVER marked PAID by this component — it stays PENDING_PAYMENT
 *    until the seller physically scans the buyer's handover QR
 */
export default function UpiQRPanel({ order, onClose, onPaymentComplete }) {
  const { user } = useAuth();

  const [qrSrc, setQrSrc] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [sellerUpi, setSellerUpi] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [upiError, setUpiError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Resolve the seller ID from the populated or raw order
  const sellerId = order?.seller?._id || order?.seller;
  const amount = order?.amount;
  const orderId = order?.orderId;
  const product = order?.product;

  // Build UPI deep-link string
  const buildUpiString = useCallback((upiId, name, amt, oid) => {
    const note = encodeURIComponent(`ZXAAA-${oid}`);
    const sellerNameEncoded = encodeURIComponent(name || 'Seller');
    return `upi://pay?pa=${upiId}&pn=${sellerNameEncoded}&am=${amt}&cu=INR&tn=${note}`;
  }, []);

  useEffect(() => {
    if (!sellerId || !user?.token) return;

    const fetchAndGenerate = async () => {
      setQrLoading(true);
      setUpiError('');

      try {
        // Fetch seller's live UPI ID from backend (never hardcoded)
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API}/auth/upi/${sellerId}`, config);
        const { upiId, name } = data.data;

        if (!upiId) {
          setUpiError('The seller has not set up a UPI ID yet. Please use Pay at Pickup or contact the seller.');
          setQrLoading(false);
          return;
        }

        setSellerUpi(upiId);
        setSellerName(name);

        // Generate QR from live UPI intent string
        const upiString = buildUpiString(upiId, name, amount, orderId);

        const url = await QRCode.toDataURL(upiString, {
          width: 480,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });

        setQrSrc(url);
      } catch (err) {
        setUpiError(err.response?.data?.message || 'Failed to load seller UPI details. Please try again.');
      } finally {
        setQrLoading(false);
      }
    };

    fetchAndGenerate();
  }, [sellerId, user?.token, amount, orderId, buildUpiString]);

  const handleCopyUpi = () => {
    if (!sellerUpi) return;
    navigator.clipboard.writeText(sellerUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  const handleOpenUpiApp = () => {
    if (!sellerUpi) return;
    const upiString = buildUpiString(sellerUpi, sellerName, amount, orderId);
    window.location.href = upiString;
  };

  const handleDownloadQR = () => {
    if (!qrSrc) return;
    const a = document.createElement('a');
    a.href = qrSrc;
    a.download = `ZXAAA-UPI-QR-${orderId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCompletePayment = async () => {
    if (!window.confirm('Have you successfully completed the payment in your UPI app? If yes, click OK to generate your bill.')) return;
    
    setCompleting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API}/orders/complete-upi`, { orderId: order._id }, config);
      if (onPaymentComplete) {
        onPaymentComplete(data.data);
      }
      if (onClose) onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete payment. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="rounded-[28px] overflow-hidden shadow-2xl relative"
      style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-primary-glow)' }}>

      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb, #059669)' }} />

      <div className="p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3"
              style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)', color: 'var(--color-zxaaa-text)' }}>
              <ShieldCheck size={12} /> UPI Payment QR
            </div>
            <h2 className="text-2xl font-black text-[var(--color-zxaaa-text)]">Pay via UPI</h2>
            <p className="text-sm text-[var(--color-zxaaa-muted)] mt-1 max-w-md">
              Scan this QR in any UPI app — Google Pay, PhonePe, Paytm, or your bank app.
            </p>
          </div>
          {onClose && (
            <button onClick={onClose}
              className="shrink-0 p-2 rounded-xl text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/10 transition-all">
              ✕
            </button>
          )}
        </div>

        {/* Order Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Package size={14} />, label: 'Product', val: product?.title || 'Item', color: 'text-purple-400' },
            { icon: <IndianRupee size={14} />, label: 'Amount', val: `₹${amount?.toLocaleString('en-IN')}`, color: 'text-emerald-400' },
            { icon: <UserIcon size={14} />, label: 'Seller', val: sellerName || (order?.seller?.name) || '—', color: 'text-blue-400' },
            {
              icon: <Hash size={14} />, label: 'Order ID', val: orderId?.slice(-10) || '—', color: 'text-amber-400',
              copy: handleCopyOrderId, copied: copiedOrderId,
            },
          ].map((item) => (
            <div key={item.label}
              className="p-3 rounded-2xl flex flex-col gap-1 relative group"
              style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)' }}>
              <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${item.color}`}>
                {item.icon} {item.label}
              </span>
              <span className="text-xs font-bold text-[var(--color-zxaaa-text)] truncate">{item.val}</span>
              {item.copy && (
                <button onClick={item.copy}
                  className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 text-[var(--color-zxaaa-muted)] hover:text-white">
                  {item.copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* QR Code Area */}
        <div className="flex flex-col lg:flex-row items-center gap-8">

          {/* QR Box */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <div className="relative p-5 rounded-3xl bg-white shadow-2xl border-4"
              style={{ borderColor: 'var(--color-zxaaa-primary-glow)', width: 240, height: 240 }}>

              {/* Corner flourishes */}
              {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-4 h-4 rounded-sm`}
                  style={{ background: '#7c3aed', opacity: 0.15 }} />
              ))}

              {qrLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                  <QrCode size={32} className="animate-pulse text-purple-600" />
                  <span className="text-xs font-semibold">Generating QR...</span>
                </div>
              ) : upiError ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
                  <AlertCircle size={28} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-600 leading-tight">{upiError}</span>
                </div>
              ) : qrSrc ? (
                <img src={qrSrc} alt="UPI Payment QR Code" className="w-full h-full object-contain rounded-xl" />
              ) : null}
            </div>

            {/* QR label */}
            {!upiError && !qrLoading && (
              <div className="text-center">
                <p className="text-xs font-black text-[var(--color-zxaaa-text)]">Scan to Pay ₹{amount?.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-[var(--color-zxaaa-muted)] mt-0.5">Works with all UPI apps</p>
              </div>
            )}
          </div>

          {/* Actions & UPI Info */}
          <div className="flex-1 w-full space-y-4">

            {/* UPI ID display + copy */}
            {sellerUpi && (
              <div className="p-4 rounded-2xl space-y-2"
                style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)' }}>
                <p className="text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider">Paying To (Seller UPI ID)</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-black text-[var(--color-zxaaa-text)] truncate">{sellerUpi}</span>
                  <button onClick={handleCopyUpi}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)', color: copiedUpi ? '#34d399' : 'var(--color-zxaaa-text)' }}>
                    {copiedUpi ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy UPI ID</>}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sellerUpi && (
                <button onClick={handleOpenUpiApp}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-[var(--color-zxaaa-text)] transition-all border hover:bg-white/5"
                  style={{ background: 'var(--color-zxaaa-bg)', borderColor: 'var(--color-zxaaa-border)' }}>
                  <Smartphone size={16} /> Open UPI App
                </button>
              )}
              {qrSrc && (
                <button onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all hover:bg-white/5"
                  style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)', color: 'var(--color-zxaaa-text)' }}>
                  <Download size={16} /> Save QR Image
                </button>
              )}
            </div>

            {/* Complete Payment Button */}
            <button
              onClick={handleCompletePayment}
              disabled={completing || !sellerUpi}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
            >
              {completing ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
              {completing ? 'Processing...' : 'I Have Paid - Generate Bill'}
            </button>

            {/* Payment Status — Pending until clicked */}
            <div className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <Clock size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">Payment Verification</p>
                <p className="text-[11px] text-[var(--color-zxaaa-muted)] mt-1 leading-relaxed">
                  Once you have successfully transferred the amount, click "I Have Paid" above to instantly generate your digital bill.
                </p>
              </div>
            </div>

            {/* Supported apps */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-[var(--color-zxaaa-muted)] font-bold uppercase tracking-wider">Works with:</span>
              {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'All UPI Apps'].map(app => (
                <span key={app} className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)', color: 'var(--color-zxaaa-muted)' }}>
                  {app}
                </span>
              ))}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-zxaaa-muted)]">
              <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
              <span>ZXAAA never asks for your UPI PIN. Do not enter your PIN anywhere on this site.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
