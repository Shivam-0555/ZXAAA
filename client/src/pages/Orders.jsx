import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ListOrdered, ShoppingBag, ShieldCheck, RefreshCw,
  Clock, CheckCircle, QrCode, X, IndianRupee, Smartphone,
} from 'lucide-react';
import UpiQRPanel from '../components/UpiQRPanel';

const STATUS_STYLES = {
  COMPLETED:       { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' },
  PAID:            { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Paid' },
  PENDING_PAYMENT: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   label: 'Payment Pending' },
  CREATED:         { bg: 'bg-blue-500/10',     text: 'text-blue-400',    border: 'border-blue-500/30',    label: 'Created' },
  CANCELLED:       { bg: 'bg-red-500/10',      text: 'text-red-400',     border: 'border-red-500/30',     label: 'Cancelled' },
  REFUNDED:        { bg: 'bg-purple-500/10',   text: 'text-purple-400',  border: 'border-purple-500/30',  label: 'Refunded' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: 'bg-white/5', text: 'text-[var(--color-zxaaa-muted)]', border: 'border-white/10', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      {status === 'PENDING_PAYMENT' && <Clock size={10} />}
      {(status === 'COMPLETED' || status === 'PAID') && <CheckCircle size={10} />}
      {s.label}
    </span>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'bought';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // UPI QR modal state
  const [upiModalOrder, setUpiModalOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        // Fetch My Orders (now uses proper populated endpoint)
        const { data: orderRes } = await axios.get('http://localhost:5000/api/orders/myorders', config);
        const myOrders = orderRes.data || [];

        // Fetch My Listed Products for Sold history
        const { data: prodRes } = await axios.get('http://localhost:5000/api/products', config);
        const allProducts = prodRes.data || [];
        const userSold = allProducts.filter(p =>
          (p.seller?._id === user._id || p.seller === user._id) && p.status === 'SOLD'
        );

        // Fetch My Swaps
        let mySwaps = [];
        try {
          const { data: swapRes } = await axios.get('http://localhost:5000/api/swaps', config);
          mySwaps = (swapRes.data || []).filter(s =>
            s.proposer === user._id || s.receiver === user._id ||
            s.proposer?._id === user._id || s.receiver?._id === user._id
          );
        } catch (e) {}

        if (!cancelled) {
          setOrders(myOrders);
          setSoldProducts(userSold);
          setSwaps(mySwaps);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const boughtOrders = orders.filter(o => o.buyer === user?._id || o.buyer?._id === user?._id);

  // Determine if an order has a pending UPI payment
  const isUpiPending = (ord) =>
    ord.paymentMethod === 'Online Payment' &&
    (ord.orderStatus === 'CREATED' || ord.orderStatus === 'PENDING_PAYMENT') &&
    ord.orderStatus !== 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* UPI QR Modal */}
      {upiModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setUpiModalOrder(null)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px]"
            onClick={e => e.stopPropagation()}>
            <UpiQRPanel 
              order={upiModalOrder} 
              onClose={() => setUpiModalOrder(null)}
              onPaymentComplete={(updatedOrder) => {
                // Update local orders state with the completed order
                setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
                setUpiModalOrder(null);
              }}
            />
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--color-zxaaa-text)]">Order & Deal History</h1>
        <p className="text-xs md:text-sm text-[var(--color-zxaaa-muted)] mt-1">
          Track all your bought, sold, and swapped items in one place.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        {[
          { id: 'bought',  label: 'Bought',  count: boughtOrders.length, icon: <ShoppingBag size={15} /> },
          { id: 'sold',    label: 'Sold',    count: soldProducts.length,  icon: <ShieldCheck size={15} /> },
          { id: 'swapped', label: 'Swapped', count: swaps.length,         icon: <RefreshCw size={15} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-[var(--color-zxaaa-muted)] hover:text-[var(--color-zxaaa-text)] hover:bg-black/5'
            }`}>
            {tab.icon}
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === 'bought' ? (
        boughtOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
            style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
            <ShoppingBag size={40} className="text-[var(--color-zxaaa-muted)] opacity-60 mb-3" />
            <h3 className="text-[var(--color-zxaaa-text)] font-bold text-base mb-1">No bought items yet</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mb-5 max-w-xs text-center">Explore nearby deals and purchase pre-loved products securely.</p>
            <Link to="/explore" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {boughtOrders.map(ord => (
              <div key={ord._id} className="p-4 rounded-2xl"
                style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Product thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white/5 border border-white/10">
                      {ord.product?.images?.[0] ? (
                        <img src={ord.product.images[0]} alt={ord.product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-zxaaa-text)] truncate">{ord.product?.title || 'Purchased Item'}</p>
                      <p className="text-xs font-extrabold text-purple-400 mt-0.5">₹{ord.amount?.toLocaleString('en-IN')}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <StatusBadge status={ord.orderStatus} />
                        {ord.paymentMethod === 'Online Payment' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Smartphone size={9} /> UPI
                          </span>
                        )}
                        {ord.paymentMethod === 'Pay at Pickup' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-[var(--color-zxaaa-muted)] border border-white/10">
                            Pickup
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--color-zxaaa-muted)] mt-1">
                        Order #{ord.orderId?.slice(-8) || ord._id?.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/orders/${ord._id}`}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-primary-glow)] bg-[var(--color-zxaaa-primary-bg)] hover:bg-[var(--color-zxaaa-primary)] hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Clock size={13} /> View Timeline
                    </Link>
                    {isUpiPending(ord) && (
                      <button
                        onClick={() => setUpiModalOrder(ord)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 2px 10px rgba(124,58,237,0.35)' }}
                      >
                        <QrCode size={14} /> Show UPI QR
                      </button>
                    )}
                  </div>
                </div>

                {/* Pending payment notice inline */}
                {isUpiPending(ord) && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-zxaaa-border)] flex items-center gap-2">
                    <Clock size={13} className="text-amber-400 shrink-0" />
                    <p className="text-[11px] text-amber-400 font-bold">
                      Payment verification pending — complete payment in your UPI app, then show handover QR to seller.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'sold' ? (
        soldProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
            style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
            <ShieldCheck size={40} className="text-[var(--color-zxaaa-muted)] opacity-60 mb-3" />
            <h3 className="text-[var(--color-zxaaa-text)] font-bold text-base mb-1">No sold products yet</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mb-5 max-w-xs text-center">List your unused items to start earning cash on ZXAAA.</p>
            <Link to="/sell" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors">
              + List Item Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {soldProducts.map(p => (
              <div key={p._id} className="p-4 rounded-2xl flex items-center justify-between gap-4"
                style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white/5 border border-white/10 relative">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--color-zxaaa-text)] truncate">{p.title}</p>
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">SOLD</span>
                    </div>
                    <p className="text-xs font-extrabold text-emerald-400 mt-0.5">₹{p.price?.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-[var(--color-zxaaa-muted)] mt-1">Location: {p.city || 'Vadodara'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        swaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
            style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
            <RefreshCw size={40} className="text-[var(--color-zxaaa-muted)] opacity-60 mb-3" />
            <h3 className="text-[var(--color-zxaaa-text)] font-bold text-base mb-1">No swap history yet</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mb-5 max-w-xs text-center">Propose item trades directly in the Swap Center.</p>
            <Link to="/swap" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors">
              Explore Swap Center
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {swaps.map(sw => (
              <div key={sw._id} className="p-4 rounded-2xl flex items-center justify-between gap-4"
                style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="flex items-center gap-3">
                  <RefreshCw size={20} className="text-purple-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[var(--color-zxaaa-text)]">Swap Deal #{sw._id?.slice(-6)}</p>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">Status: {sw.status || 'COMPLETED'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
