import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ListOrdered, ShoppingBag, ShieldCheck, RefreshCw, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'bought';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Fetch My Orders
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Order & Deal History</h1>
        <p className="text-xs md:text-sm text-[var(--color-zxaaa-muted)] mt-1">
          Track all your bought, sold, and swapped items in one place.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        {[
          { id: 'bought', label: 'Bought', count: boughtOrders.length, icon: <ShoppingBag size={15} /> },
          { id: 'sold', label: 'Sold', count: soldProducts.length, icon: <ShieldCheck size={15} /> },
          { id: 'swapped', label: 'Swapped', count: swaps.length, icon: <RefreshCw size={15} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.04]'
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
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
            <ShoppingBag size={40} className="text-[var(--color-zxaaa-muted)] opacity-60 mb-3" />
            <h3 className="text-white font-bold text-base mb-1">No bought items yet</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mb-5 max-w-xs text-center">Explore nearby deals and purchase pre-loved products securely.</p>
            <Link to="/explore" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {boughtOrders.map(ord => (
              <div key={ord._id} className="p-4 rounded-2xl flex items-center justify-between gap-4"
                style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white/5 border border-white/10">
                    {ord.product?.images?.[0] ? (
                      <img src={ord.product.images[0]} alt={ord.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{ord.product?.title || 'Purchased Item'}</p>
                    <p className="text-xs font-extrabold text-purple-400 mt-0.5">₹{ord.amount?.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-[var(--color-zxaaa-muted)] mt-1 flex items-center gap-2">
                      <span>Txn ID: {ord._id?.slice(-8)}</span>
                      <span>•</span>
                      <span>Status: <strong className="text-emerald-400">{ord.status || 'COMPLETED'}</strong></span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'sold' ? (
        soldProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
            <ShieldCheck size={40} className="text-[var(--color-zxaaa-muted)] opacity-60 mb-3" />
            <h3 className="text-white font-bold text-base mb-1">No sold products yet</h3>
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
                      <p className="text-sm font-bold text-white truncate">{p.title}</p>
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        SOLD
                      </span>
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
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
            <RefreshCw size={40} className="text-[var(--color-zxaaa-muted)] opacity-60 mb-3" />
            <h3 className="text-white font-bold text-base mb-1">No swap history yet</h3>
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
                    <p className="text-sm font-bold text-white">Swap Deal #{sw._id?.slice(-6)}</p>
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
