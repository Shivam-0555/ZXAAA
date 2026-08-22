import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Package, ShoppingBag, RefreshCw, MessageSquare, Bell,
  Clock, CheckCircle, XCircle, ChevronRight, Star, Award, Zap, AlertCircle
} from 'lucide-react';

export default function RightContextualPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState({
    listings: 0,
    sold: 0,
    bought: 0,
    swapped: 0
  });

  const [pendingRequests, setPendingRequests] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Fetch user products to count listings & sold items
        const { data: prodRes } = await axios.get('http://localhost:5000/api/products', config);
        const allProducts = prodRes.data || [];
        const userProducts = allProducts.filter(p => p.seller?._id === user._id || p.seller === user._id);
        const soldCount = userProducts.filter(p => p.status === 'SOLD').length;

        // Fetch orders
        let boughtCount = 0;
        let pendingSellerReqs = [];
        try {
          const { data: orderRes } = await axios.get('http://localhost:5000/api/orders/myorders', config);
          const orders = orderRes.data || [];
          boughtCount = orders.filter(o => o.buyer === user._id || o.buyer?._id === user._id).length;
          
          // Pending requests where user is the seller
          pendingSellerReqs = orders.filter(o => 
            (o.seller === user._id || o.seller?._id === user._id) && o.status === 'PENDING'
          );
        } catch (e) {
          // Orders endpoint fallback
        }

        // Fetch notifications
        let notifCount = 0;
        try {
          const { data: notifRes } = await axios.get('http://localhost:5000/api/notifications', config);
          notifCount = notifRes.unreadCount || 0;
        } catch (e) {}

        if (!cancelled) {
          setUserStats({
            listings: userProducts.length,
            sold: soldCount || user.productsSold || 0,
            bought: boughtCount || user.productsBought || 0,
            swapped: user.swapsCount || 0
          });
          setPendingRequests(pendingSellerReqs);
          setUnreadNotifications(notifCount);
        }
      } catch (err) {
        console.error('Right panel data fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUserData();
    return () => { cancelled = true; };
  }, [user]);

  const handleOrderAction = async (orderId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status }, config);
      setPendingRequests(prev => prev.filter(req => req._id !== orderId));
    } catch (err) {
      alert('Failed to update request status');
    }
  };

  return (
    <aside className="w-full xl:w-[320px] flex flex-col gap-5 shrink-0">

      {/* ── USER PANEL / JOIN PANEL ── */}
      {!user ? (
        <div className="rounded-[22px] p-6 text-center"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 20px rgba(124,58,237,0.2)'
            }}>
            <Package size={26} className="text-purple-400" />
          </div>
          <h3 className="font-extrabold text-white text-lg mb-1">Join ZXAAA</h3>
          <p className="text-xs text-[var(--color-zxaaa-muted)] mb-5 leading-relaxed">
            Create an account to buy, sell, or swap products with verified local users.
          </p>
          <div className="flex gap-2.5">
            <Link to="/login" className="flex-1 py-2.5 text-xs font-bold text-center rounded-xl text-white transition-all hover:bg-white/10"
              style={{ border: '1px solid var(--color-zxaaa-border)', background: 'rgba(255,255,255,0.03)' }}>
              Sign In
            </Link>
            <Link to="/register" className="flex-1 py-2.5 text-xs font-extrabold text-center rounded-xl text-white transition-all hover:opacity-90 shadow-md"
              style={{ background: 'var(--color-zxaaa-primary, #7c3aed)' }}>
              Sign Up
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-[22px] p-5"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          
          <div className="flex items-center gap-3.5 mb-5 pb-4" style={{ borderBottom: '1px solid var(--color-zxaaa-border)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary, #7c3aed), #2563eb)' }}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[11px] text-[var(--color-zxaaa-muted)]">Your ZXAAA Profile</p>
              <p className="font-bold text-white text-base truncate leading-tight">
                {user.name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">Verified Member</span>
              </div>
            </div>
          </div>

          {/* User Stats Grid */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Your Activity</span>
            <Link to="/orders" className="text-[11px] font-semibold text-purple-400 hover:underline">
              View History
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Listings', val: userStats.listings, icon: <Package size={14} className="text-purple-400" />, to: '/sell' },
              { label: 'Sold', val: userStats.sold, icon: <ShieldCheck size={14} className="text-emerald-400" />, to: '/orders?tab=sold' },
              { label: 'Bought', val: userStats.bought, icon: <ShoppingBag size={14} className="text-blue-400" />, to: '/orders?tab=bought' },
              { label: 'Swapped', val: userStats.swapped, icon: <RefreshCw size={14} className="text-amber-400" />, to: '/orders?tab=swapped' },
            ].map(s => (
              <Link key={s.label} to={s.to} className="rounded-xl p-2.5 flex items-center gap-2.5 transition-all hover:bg-white/[0.04]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="p-1.5 rounded-lg shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--color-zxaaa-muted)] font-medium leading-none mb-1">{s.label}</p>
                  <p className="text-sm font-extrabold text-white leading-none">{s.val}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── QUICK ACTIVITY CARD ── */}
      {user && (
        <div className="rounded-[22px] p-5"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Quick Activity
            </h4>
            {unreadNotifications > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white">
                {unreadNotifications} New
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Link to="/messages" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
              style={{ border: '1px solid var(--color-zxaaa-border)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} className="text-blue-400" />
                <span className="text-xs font-semibold text-white">Unread Messages</span>
              </div>
              <span className="text-xs font-bold text-[var(--color-zxaaa-muted)]">
                {unreadMessages > 0 ? unreadMessages : '0'}
              </span>
            </Link>

            <Link to="/notifications" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
              style={{ border: '1px solid var(--color-zxaaa-border)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2.5">
                <Bell size={16} className="text-purple-400" />
                <span className="text-xs font-semibold text-white">Notifications</span>
              </div>
              <span className="text-xs font-bold text-[var(--color-zxaaa-muted)]">
                {unreadNotifications > 0 ? unreadNotifications : '0'}
              </span>
            </Link>

            <Link to="/swap" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
              style={{ border: '1px solid var(--color-zxaaa-border)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2.5">
                <RefreshCw size={16} className="text-emerald-400" />
                <span className="text-xs font-semibold text-white">Swap Requests</span>
              </div>
              <span className="text-xs font-bold text-[var(--color-zxaaa-muted)]">0</span>
            </Link>
          </div>

          {unreadNotifications === 0 && unreadMessages === 0 && (
            <p className="text-[11px] text-[var(--color-zxaaa-muted)] text-center pt-2.5 font-medium">
              You're all caught up! No new activity.
            </p>
          )}
        </div>
      )}

      {/* ── ZXAAA TRUST CARD ── */}
      <div className="rounded-[22px] p-5"
        style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award size={15} className="text-purple-400" />
            ZXAAA Trust Score
          </h4>
          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            High Reputation
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(16,185,129,0.15))', border: '1px solid rgba(124,58,237,0.3)' }}>
            <span className="text-lg font-black text-white leading-none">4.9</span>
            <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5 mt-1">
              <Star size={9} fill="currentColor" /> Trust
            </span>
          </div>

          <div className="space-y-1.5 flex-1 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--color-zxaaa-muted)]">Response Rate</span>
              <span className="font-bold text-white">98%</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--color-zxaaa-muted)]">Completed Deals</span>
              <span className="font-bold text-white">{userStats.sold + userStats.bought}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--color-zxaaa-muted)]">Verification</span>
              <span className="font-bold text-emerald-400">100% Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SELLER RESPONSE CARD ── */}
      {user && (
        <div className="rounded-[22px] p-5"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-blue-400" />
              Seller Response
            </h4>
            <span className="text-[10px] text-[var(--color-zxaaa-muted)] font-medium">Within 2 hrs</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-4 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--color-zxaaa-border)' }}>
              <CheckCircle size={20} className="mx-auto mb-1.5 text-[var(--color-zxaaa-muted)] opacity-60" />
              <p className="text-xs font-semibold text-[var(--color-zxaaa-muted)]">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req._id} className="p-3 rounded-xl space-y-2.5"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[170px]">{req.product?.title || 'Purchase Request'}</p>
                      <p className="text-[10px] text-[var(--color-zxaaa-muted)]">Buyer: {req.buyer?.name || 'Customer'}</p>
                    </div>
                    <span className="text-[10px] font-black text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10">
                      ₹{req.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOrderAction(req._id, 'APPROVED')}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors">
                      Accept
                    </button>
                    <button
                      onClick={() => handleOrderAction(req._id, 'CANCELLED')}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors">
                      Reject
                    </button>
                    <button
                      onClick={() => navigate('/messages')}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors">
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </aside>
  );
}
