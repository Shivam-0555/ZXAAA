import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OrderTimeline from '../components/OrderTimeline';
import RealQRCode from '../components/RealQRCode';
import UpiQRPanel from '../components/UpiQRPanel';
import {
  ArrowLeft, ShoppingBag, ShieldCheck, QrCode, Smartphone,
  CheckCircle2, Clock, MapPin, User, Loader2, AlertCircle
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchOrder = async () => {
    if (!user || !id) return;
    try {
      setLoading(true);
      setError(null);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
      setOrder(data.data);
    } catch (err) {
      console.error('Fetch order error:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, user]);

  const handleSellerAccept = async () => {
    if (!user || !order) return;
    try {
      setActionLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/orders/${order._id}/accept`, {}, config);
      setOrder(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSellerPickupReady = async () => {
    if (!user || !order) return;
    try {
      setActionLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/orders/${order._id}/pickup-ready`, {}, config);
      setOrder(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pickup status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 skeleton rounded-lg" />
            <div className="h-4 w-32 skeleton rounded" />
          </div>
        </div>
        <div className="h-48 skeleton rounded-[24px]" />
        <div className="h-96 skeleton rounded-[24px]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-[28px] bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] text-center space-y-4">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h2 className="text-xl font-black text-[var(--color-zxaaa-text)]">Order Not Found</h2>
        <p className="text-sm text-[var(--color-zxaaa-muted)]">{error || 'Could not find the requested order.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to My Orders
        </button>
      </div>
    );
  }

  const isSeller = user?._id === (order.seller?._id || order.seller);
  const isBuyer = user?._id === (order.buyer?._id || order.buyer);
  const isCompleted = order.orderStatus === 'COMPLETED';

  const isAccepted = order.timeline?.sellerAccepted?.status === 'completed' || isCompleted;
  const isPickupReady = order.timeline?.pickupReady?.status === 'completed' || isCompleted;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* UPI QR Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowUpiModal(false)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px]"
            onClick={e => e.stopPropagation()}>
            <UpiQRPanel 
              order={order} 
              onClose={() => setShowUpiModal(false)}
              onPaymentComplete={(updatedOrder) => {
                setOrder(updatedOrder);
                setShowUpiModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Buyer QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowQrModal(false)}>
          <div className="bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-primary-glow)] p-8 rounded-[28px] max-w-md w-full text-center space-y-4"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-[var(--color-zxaaa-text)]">Handover QR Code</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)]">Show this QR code to the seller at pickup to verify and finalize the transaction.</p>
            <div className="flex justify-center py-4">
              <RealQRCode
                value={order.qrReference}
                title="Buyer Verification QR"
                subtitle={`Order ID: ${order.orderId}`}
              />
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="btn-secondary w-full py-3 text-xs font-bold"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}

      {/* Back Button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] text-[var(--color-zxaaa-muted)] hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-[var(--color-zxaaa-text)]">Order Details</h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-zxaaa-card2)] text-[var(--color-zxaaa-muted)] border border-[var(--color-zxaaa-border)] font-bold">
                #{order.orderId?.slice(-8) || order._id?.slice(-8)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mt-0.5 font-medium">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div>
          {isSeller ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck size={14} /> You are the Seller
            </span>
          ) : isBuyer ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingBag size={14} /> You are the Buyer
            </span>
          ) : null}
        </div>
      </div>

      {/* Order Info Card */}
      <div className="p-6 md:p-8 rounded-[28px] bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          
          {/* Product Thumbnail & Title */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] flex items-center justify-center">
              {order.product?.images?.[0] ? (
                <img src={order.product.images[0]} alt={order.product.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📦</span>
              )}
            </div>
            <div className="min-w-0">
              <Link to={`/product/${order.product?._id}`} className="text-lg font-black text-[var(--color-zxaaa-text)] hover:text-purple-400 transition-colors truncate block">
                {order.product?.title || 'Purchased Product'}
              </Link>
              <p className="text-2xl font-black text-purple-400 mt-1">
                ₹{order.amount?.toLocaleString('en-IN')}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-zxaaa-card2)] text-[var(--color-zxaaa-muted)] border border-[var(--color-zxaaa-border)]">
                  {order.paymentMethod}
                </span>
                {isCompleted && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Details Box */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-6">
              <span className="text-[var(--color-zxaaa-muted)] font-bold">Seller:</span>
              <span className="font-extrabold text-[var(--color-zxaaa-text)]">{order.seller?.name || 'Verified Seller'}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-[var(--color-zxaaa-muted)] font-bold">Buyer:</span>
              <span className="font-extrabold text-[var(--color-zxaaa-text)]">{order.buyer?.name || 'Buyer'}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-[var(--color-zxaaa-muted)] font-bold">Location:</span>
              <span className="font-bold text-[var(--color-zxaaa-text)]">{order.product?.city || 'Vadodara'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls for Seller & Buyer */}
        {!isCompleted && (
          <div className="pt-4 border-t border-[var(--color-zxaaa-border)] flex flex-wrap gap-3">
            {/* Seller Actions */}
            {isSeller && (
              <>
                {!isAccepted && (
                  <button
                    onClick={handleSellerAccept}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Accept Order Request
                  </button>
                )}

                {isAccepted && !isPickupReady && (
                  <button
                    onClick={handleSellerPickupReady}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-5 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Mark Ready for Pickup
                  </button>
                )}

                <Link
                  to="/seller/scan-qr"
                  className="flex-1 py-3 px-5 rounded-xl text-xs font-black text-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-primary-glow)] bg-[var(--color-zxaaa-primary-bg)] hover:bg-[var(--color-zxaaa-primary)] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <QrCode size={16} /> Scan Buyer QR Code
                </Link>
              </>
            )}

            {/* Buyer Actions */}
            {isBuyer && (
              <>
                {order.paymentMethod === 'Online Payment' && order.paymentStatus !== 'SUCCESS' && (
                  <button
                    onClick={() => setShowUpiModal(true)}
                    className="flex-1 py-3 px-5 rounded-xl text-xs font-black text-white transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}
                  >
                    <Smartphone size={16} /> Show UPI QR / Pay
                  </button>
                )}

                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex-1 btn-secondary py-3 px-5 text-xs font-black flex items-center justify-center gap-2 border-[var(--color-zxaaa-primary-glow)]"
                >
                  <QrCode size={16} /> Show Pickup QR Code
                </button>
              </>
            )}
            {/* Completed Receipt Download Button */}
            {isCompleted && (
              <button
                onClick={() => window.print()}
                className="w-full py-3.5 px-5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] no-print"
              >
                <ShieldCheck size={16} /> Download / Print Digital Receipt
              </button>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="pt-4 border-t border-[var(--color-zxaaa-border)] flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="w-full py-3.5 px-5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] no-print"
            >
              <ShieldCheck size={16} /> Download / Print Digital Receipt
            </button>
          </div>
        )}
      </div>

      {/* Printable Receipt Block */}
      <div id="printable-receipt" className="hidden print:block p-8 border-2 border-black space-y-4 bg-white text-black font-sans">
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-black">ZXAAA MARKETPLACE</h1>
          <p className="text-xs font-bold text-gray-600">Digital Transaction Receipt</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div><span className="font-bold">Order ID:</span> #{order.orderId}</div>
          <div><span className="font-bold">QR Ref:</span> {order.qrReference}</div>
          <div><span className="font-bold">Buyer:</span> {order.buyer?.name}</div>
          <div><span className="font-bold">Seller:</span> {order.seller?.name}</div>
          <div><span className="font-bold">Product:</span> {order.product?.title}</div>
          <div><span className="font-bold">Payment Method:</span> {order.paymentMethod}</div>
          <div><span className="font-bold">Item Price:</span> ₹{order.amount}</div>
          <div><span className="font-bold">Emergency Charge:</span> ₹{order.emergencyCharge || 0}</div>
          <div className="col-span-2 text-base font-black border-t pt-2"><span className="font-bold">Total Paid:</span> ₹{order.finalAmount || order.amount}</div>
          <div className="col-span-2 text-[10px] text-gray-500 text-center mt-4">Verified & Secured by ZXAAA Pay • {new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Embed ZXAAA Activity Timeline */}
      <div className="no-print">
        <OrderTimeline order={order} loading={loading} error={error} />
      </div>
    </div>
  );
}
