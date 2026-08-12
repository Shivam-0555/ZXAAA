import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import HowItWorksModal from '../components/HowItWorksModal';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import {
  Smartphone, Laptop, Bike, Armchair, BookOpen, Shirt, Zap, MoreHorizontal,
  RefreshCw, QrCode, Search, ArrowRight, Star, TrendingUp, Package, ShoppingBag,
} from 'lucide-react';

const CATEGORIES = [
  { label: 'Mobiles',     icon: <Smartphone size={22} />,   color: '#3b82f6' },
  { label: 'Laptops',     icon: <Laptop size={22} />,       color: '#8b5cf6' },
  { label: 'Bikes',       icon: <Bike size={22} />,         color: '#f59e0b' },
  { label: 'Furniture',   icon: <Armchair size={22} />,     color: '#10b981' },
  { label: 'Books',       icon: <BookOpen size={22} />,     color: '#06b6d4' },
  { label: 'Clothes',     icon: <Shirt size={22} />,        color: '#ec4899' },
  { label: 'Electronics', icon: <Zap size={22} />,          color: '#f97316' },
  { label: 'More',        icon: <MoreHorizontal size={22} />, color: '#94a3b8' },
];

function CategoryChip({ cat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`category-chip ${active ? 'active' : ''}`}
      style={{ minWidth: 82 }}
    >
      <span style={{ color: active ? cat.color : '#64748b', transition: 'color 0.2s' }}>{cat.icon}</span>
      <span className="text-[11px] font-semibold" style={{ color: active ? '#e2e8f0' : '#64748b' }}>{cat.label}</span>
    </button>
  );
}

export default function Home() {
  const { selectedLocation, radiusKm } = useLocationContext();
  const { user } = useAuth();

  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [searchQ, setSearchQ]         = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { longitude, latitude } = selectedLocation;
        const maxDistance = radiusKm * 1000;
        let url = `http://localhost:5000/api/products?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`;
        if (activeCategory && activeCategory !== 'More') url += `&category=${encodeURIComponent(activeCategory)}`;
        const { data } = await axios.get(url);
        let list = data.data || [];
        if (list.length === 0) {
          const fb = await axios.get('http://localhost:5000/api/products');
          list = fb.data.data || [];
        }
        if (!cancelled) setProducts(list);
      } catch {
        try {
          const fb = await axios.get('http://localhost:5000/api/products');
          if (!cancelled) setProducts(fb.data.data || []);
        } catch { /* ignore */ }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [selectedLocation, radiusKm, activeCategory]);

  const filtered = searchQ.trim()
    ? products.filter(p =>
        p.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQ.toLowerCase()))
    : products;

  const topPicks  = filtered.slice(0, 8);
  const nearbyDeals = filtered.slice(0, 5);

  return (
    <div className="flex gap-6 min-h-full" style={{ alignItems: 'flex-start' }}>

      {/* ──────────────────────── MAIN COLUMN ──────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6 pb-8">

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl hero-gradient p-8 md:p-10"
          style={{ border: '1px solid rgba(30,33,48,0.8)', minHeight: 220 }}>

          {/* Glow orbs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-12 right-32 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ZXAAA Marketplace — Now Live in {selectedLocation.name.split(',')[0]}
            </span>

            <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-2 text-white">
              Buy. Sell. Swap.
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-1 gradient-text">
              Anything. Anywhere.
            </p>
            <p className="text-[var(--color-zxaaa-muted)] text-sm mb-7 max-w-sm">
              Discover secondhand gems and give your items a new life — all verified with QR.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/explore"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 24px rgba(124,58,237,0.35)' }}>
                <Search size={16} /> Explore Now
              </Link>
              <button
                onClick={() => setHowItWorksOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                How It Works
              </button>
            </div>
          </div>

          {/* Hero right decoration */}
          <div className="absolute right-6 top-6 hidden lg:flex flex-col gap-3 opacity-80">
            <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold text-white"
              style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
              <QrCode size={18} className="text-purple-400" /> QR Verified ✓
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold text-white"
              style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
              <Star size={16} className="text-amber-400" fill="currentColor" /> Trusted Sellers
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold text-white"
              style={{ border: '1px solid rgba(37,99,235,0.3)' }}>
              <RefreshCw size={16} className="text-blue-400" /> Swap Ready
            </div>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="w-full text-sm text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none transition-colors"
            style={{
              background: 'var(--color-zxaaa-card)',
              border: '1px solid var(--color-zxaaa-border)',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-zxaaa-border)'}
          />
        </div>

        {/* ── CATEGORIES ── */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-white">Browse Categories</h2>
            <Link to="/explore" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <CategoryChip
                key={cat.label}
                cat={cat}
                active={activeCategory === cat.label}
                onClick={() => setActiveCategory(prev => prev === cat.label ? '' : cat.label)}
              />
            ))}
          </div>
        </div>

        {/* ── TOP PICKS ── */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-400" />
              <h2 className="text-base font-bold text-white">Top Picks For You</h2>
              {!loading && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.25)' }}>
                  {filtered.length} items
                </span>
              )}
            </div>
            <Link to="/explore" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              See All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : topPicks.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
              <Package size={40} className="mx-auto mb-3 text-[var(--color-zxaaa-muted)]" />
              <p className="text-[var(--color-zxaaa-muted)] font-medium">No products found</p>
              <p className="text-xs text-[var(--color-zxaaa-muted)] mt-1">Try expanding your search radius or changing category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {topPicks.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>

        {/* ── SWAP CENTER PROMO ── */}
        <div className="relative overflow-hidden rounded-2xl p-6 md:p-8"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.12))', border: '1px solid rgba(124,58,237,0.25)' }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
          <div className="relative flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={20} className="text-blue-400" />
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', border: '1px solid rgba(37,99,235,0.3)' }}>
                  NEW FEATURE
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Swap Center is Live 🔄</h3>
              <p className="text-sm text-[var(--color-zxaaa-muted)] max-w-md">
                Propose item-for-item exchanges with nearby users. No cash needed. Pure barter, verified with QR.
              </p>
            </div>
            <Link to="/swap"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}>
              Explore Swaps <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── HOW ZXAAA WORKS ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white">How ZXAAA Works</h2>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mt-1">3 simple steps to buy, sell or swap safely</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', icon: <Search size={22} className="text-blue-400" />, title: 'Discover Nearby', desc: 'Browse listings in your city. Use location filter to set custom radius.', color: '#2563eb' },
              { step: '02', icon: <ShoppingBag size={22} className="text-purple-400" />, title: 'Meet & Inspect', desc: 'Chat with seller in-app. Meet safely in public to inspect before paying.', color: '#7c3aed' },
              { step: '03', icon: <QrCode size={22} className="text-emerald-400" />, title: 'Scan & Verify', desc: 'Buyer shows QR code. Seller scans to mark as SOLD. Instant receipt.', color: '#10b981' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-white/[0.02]"
                style={{ border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-0.5" style={{ color: s.color }}>STEP {s.step}</p>
                  <h4 className="text-sm font-bold text-white mb-1">{s.title}</h4>
                  <p className="text-xs text-[var(--color-zxaaa-muted)] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ──────────────────────── RIGHT SIDEBAR ──────────────────────── */}
      <aside className="hidden xl:flex flex-col gap-4 shrink-0" style={{ width: 288 }}>

        {/* User Card */}
        {user ? (
          <div className="rounded-2xl p-5" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-white text-sm truncate">Welcome back, {user.name?.split(' ')[0]}! 👋</p>
                <p className="text-[11px] text-[var(--color-zxaaa-muted)] truncate">{user.email}</p>
              </div>
            </div>

            {/* Wallet */}
            <div className="rounded-xl p-3.5 mb-3"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(37,99,235,0.08))', border: '1px solid rgba(124,58,237,0.2)' }}>
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-0.5">Wallet Balance</p>
              <p className="text-xl font-black text-white">₹{(user.walletPoints || 0).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-[var(--color-zxaaa-muted)] mt-0.5">Points + Cashback</p>
            </div>

            {/* Stats */}
            <p className="text-[10px] font-bold text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Your Stats</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Listings', value: user.totalListings || 0, icon: <Package size={13} className="text-blue-400" /> },
                { label: 'Sold',     value: user.productsSold  || 0, icon: <ShoppingBag size={13} className="text-emerald-400" /> },
                { label: 'Bought',   value: user.productsBought || 0, icon: <TrendingUp size={13} className="text-purple-400" /> },
              ].map(s => (
                <div key={s.label} className="stat-pill text-center">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[9px] text-[var(--color-zxaaa-muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Package size={22} className="text-purple-400" />
            </div>
            <p className="font-bold text-white text-sm mb-1">Join ZXAAA</p>
            <p className="text-[11px] text-[var(--color-zxaaa-muted)] mb-4">Sign up to list, buy & swap</p>
            <div className="flex gap-2">
              <Link to="/login" className="flex-1 py-2 text-xs font-bold text-center rounded-xl text-white transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>Sign In</Link>
              <Link to="/register" className="flex-1 py-2 text-xs font-bold text-center rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>Sign Up</Link>
            </div>
          </div>
        )}

        {/* Refer & Earn */}
        <div className="rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.05))', border: '1px solid rgba(251,191,36,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎁</span>
            <div>
              <p className="text-sm font-bold text-white">Refer &amp; Earn</p>
              <p className="text-[10px] text-amber-400">Earn ₹50 per friend</p>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-zxaaa-muted)] mb-3">Share your referral code and earn wallet points instantly.</p>
          {user ? (
            <button
              onClick={() => { navigator.clipboard.writeText(user.referralCode || 'ZX-XXXXX'); }}
              className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 text-white"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
              Copy Referral Code
            </button>
          ) : (
            <Link to="/register" className="block w-full py-2 rounded-xl text-xs font-bold text-center text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
              Sign up to Refer
            </Link>
          )}
        </div>

        {/* Nearby Deals */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              📍 Nearby Deals
            </h3>
            <Link to="/explore" className="text-[10px] text-purple-400 hover:text-purple-300">See all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton rounded-xl shrink-0" style={{ width: 52, height: 52 }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : nearbyDeals.length === 0 ? (
            <p className="text-xs text-[var(--color-zxaaa-muted)] text-center py-4">No deals nearby</p>
          ) : (
            <div className="space-y-2.5">
              {nearbyDeals.map(p => (
                <Link key={p._id} to={`/product/${p._id}`}
                  className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-white/[0.03]">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--color-zxaaa-card2)', border: '1px solid var(--color-zxaaa-border)' }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                    <p className="text-[11px] font-bold text-emerald-400">₹{p.price?.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Scan QR Quick Access */}
        <Link to="/seller/scan-qr"
          className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <QrCode size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Scan QR Code</p>
            <p className="text-[10px] text-emerald-400">Verify & complete sales</p>
          </div>
          <ArrowRight size={14} className="ml-auto text-[var(--color-zxaaa-muted)]" />
        </Link>

      </aside>

      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </div>
  );
}
