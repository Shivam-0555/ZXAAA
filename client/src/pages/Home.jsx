import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import HowItWorksModal from '../components/HowItWorksModal';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import {
  Search, Plus, RefreshCw, QrCode, ArrowRight, Sparkles, MapPin, Package, ShieldCheck, CheckCircle2, MessageSquare, Repeat
} from 'lucide-react';

/* ─────────────────────────────────────────────
   HERO VISUAL — pure CSS/SVG representing BUY, SELL, SWAP
   Blends naturally into the ZXAAA purple/blue identity
───────────────────────────────────────────── */
function HeroVisual() {
  return (
    <div style={{ position: 'relative', width: 340, height: 280 }}>
      {/* Glow Orbs */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--color-zxaaa-primary-glow) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />

      {/* Rotating Orbit Rings */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 250, height: 250,
        transform: 'translate(-50%, -50%)',
        border: '1px dashed var(--color-zxaaa-primary-glow)',
        borderRadius: '50%',
        animation: 'heroRingSpin 16s linear infinite',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 180, height: 180,
        transform: 'translate(-50%, -50%)',
        border: '1px solid var(--color-zxaaa-primary-bg)',
        borderRadius: '50%',
        animation: 'heroRingSpin 10s linear infinite reverse',
      }} />

      {/* Central ZX Emblem */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'heroFloat 4s ease-in-out infinite',
        filter: 'drop-shadow(0 0 25px var(--color-zxaaa-primary-bg))',
      }}>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center border-2"
          style={{ borderColor: 'var(--color-zxaaa-primary-glow)', background: 'var(--color-zxaaa-primary-bg)', backdropFilter: 'blur(12px)' }}>
          <img src="/zx-logo.png" alt="ZXAAA" className="w-14 h-14 object-contain filter drop-shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]" />
        </div>
      </div>

      {/* BUY Pill */}
      <div style={{
        position: 'absolute', top: 20, left: 15,
        padding: '7px 18px', borderRadius: 999,
        background: 'rgba(37,99,235,0.2)',
        border: '1px solid rgba(59,130,246,0.6)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 16px rgba(37,99,235,0.4)',
        color: '#93c5fd', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
        animation: 'heroFloat 4.5s ease-in-out infinite',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
        BUY
      </div>

      {/* SELL Pill */}
      <div style={{
        position: 'absolute', top: 35, right: 15,
        padding: '7px 18px', borderRadius: 999,
        background: 'rgba(168,85,247,0.2)',
        border: '1px solid rgba(168,85,247,0.6)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 16px rgba(124,58,237,0.4)',
        color: '#c4b5fd', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
        animation: 'heroFloat 3.8s ease-in-out infinite 0.6s',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
        SELL
      </div>

      {/* SWAP Pill */}
      <div style={{
        position: 'absolute', bottom: 25, left: '50%',
        transform: 'translateX(-50%)',
        padding: '7px 20px', borderRadius: 999,
        background: 'rgba(16,185,129,0.2)',
        border: '1px solid rgba(52,211,153,0.6)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 16px rgba(16,185,129,0.4)',
        color: '#6ee7b7', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
        animation: 'heroFloat 5s ease-in-out infinite 1.2s',
        display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      }}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        SWAP
      </div>
    </div>
  );
}

export default function Home() {
  const { selectedLocation } = useLocationContext();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapLoading, setSwapLoading] = useState(true);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const cityName = selectedLocation?.name ? selectedLocation.name.split(',')[0].trim() : 'Vadodara';

  // Fetch Nearby Products by City
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products?city=${encodeURIComponent(cityName)}`);
        if (!cancelled) {
          setProducts(data.data || []);
        }
      } catch (err) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [cityName]);

  // Fetch Real Swap Requests
  useEffect(() => {
    let cancelled = false;
    const fetchSwaps = async () => {
      setSwapLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/swaps');
        if (!cancelled) setSwaps(data.data || []);
      } catch (err) {
        if (!cancelled) setSwaps([]);
      } finally {
        if (!cancelled) setSwapLoading(false);
      }
    };
    fetchSwaps();
    return () => { cancelled = true; };
  }, []);

  // Derived sections
  const availableProducts = products.filter(p => p.status === 'AVAILABLE');
  
  // 1. Recently Added (sorted by createdAt)
  const recentlyAdded = [...availableProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  
  // 2. Available for Swap
  const swapAvailable = availableProducts.filter(p => p.isSwapEnabled).slice(0, 4);
  
  // 3. Best Deals (could be lowest price, here we'll just slice some for demo logic)
  const bestDeals = [...availableProducts].sort((a, b) => a.price - b.price).slice(0, 4);

  return (
    <div className="space-y-12">
      {/* ──────────────── 1. TOP HERO BANNER ──────────────── */}
      <div className="relative overflow-hidden rounded-[24px] hero-gradient border border-[var(--color-zxaaa-border)] p-7 md:p-12 mt-4 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-wider"
              style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)', color: 'var(--color-zxaaa-text)' }}>
              <Sparkles size={14} className="text-[var(--color-zxaaa-primary)]" />
              Verified Local Marketplace
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-4 text-white">
              Buy. Sell. Swap.
            </h1>
            <p className="text-3xl md:text-4xl font-extrabold leading-[1.1] mb-6 gradient-text">
              Anything. Anywhere.
            </p>
            <p className="text-[var(--color-zxaaa-muted)] text-base md:text-lg mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Find useful products near you, sell what you no longer need, or swap it for something you want.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link to="/explore" className="btn-primary px-8 py-4 text-sm md:text-base flex items-center gap-2">
                Explore Nearby <ArrowRight size={18} />
              </Link>
              <Link to="/sell" className="btn-secondary px-8 py-4 text-sm md:text-base flex items-center gap-2">
                Sell Something <Plus size={18} />
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center shrink-0 pointer-events-none select-none">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* ──────────────── 2. QUICK ACTIONS BAR ──────────────── */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Buy Nearby', icon: <Search size={22} className="text-blue-400" />, desc: 'Browse local items', to: '/explore', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.25)' },
            { label: 'Sell Product', icon: <Plus size={22} className="text-[var(--color-zxaaa-primary)]" />, desc: 'List unused items', to: '/sell', bg: 'var(--color-zxaaa-primary-bg)', border: 'var(--color-zxaaa-primary-glow)' },
            { label: 'Swap Item', icon: <RefreshCw size={22} className="text-emerald-400" />, desc: 'Trade & exchange', to: '/swap', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
            { label: 'Scan QR', icon: <QrCode size={22} className="text-amber-400" />, desc: 'Verify deals safely', to: '/seller/scan-qr', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
          ].map(act => (
            <Link
              key={act.label}
              to={act.to}
              className="p-5 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-1 group"
              style={{ background: 'var(--color-zxaaa-card)', border: `1px solid ${act.border}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{ background: act.bg }}>
                {act.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white leading-tight transition-colors">
                  {act.label}
                </h4>
                <p className="text-[11px] text-[var(--color-zxaaa-muted)] font-medium mt-1">
                  {act.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ──────────────── 3. DYNAMIC PRODUCT SECTIONS ──────────────── */}
      
      {/* Loading State */}
      {loading && (
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-6">Loading Products...</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && availableProducts.length === 0 && (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
          <Package size={56} className="mx-auto mb-4 text-[var(--color-zxaaa-muted)] opacity-50" />
          <h3 className="text-2xl font-bold text-white mb-2">No products nearby yet</h3>
          <p className="text-sm text-[var(--color-zxaaa-muted)] max-w-md mx-auto mb-8">
            Be the first to list an item in {cityName} or change your location to explore more.
          </p>
          <Link to="/sell" className="btn-primary px-6 py-3 flex items-center gap-2 inline-flex">
            <Plus size={18} /> Sell Product
          </Link>
        </div>
      )}

      {/* Section: Recently Added */}
      {!loading && recentlyAdded.length > 0 && (
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Products Near You</h2>
                <span className="text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5"
                  style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', color: '#f472b6' }}>
                  <MapPin size={12} /> {cityName}
                </span>
              </div>
              <p className="text-sm text-[var(--color-zxaaa-muted)] mt-1">Recently added in your area.</p>
            </div>
            <Link to="/explore?sort=newest" className="text-sm font-bold text-[var(--color-zxaaa-primary)] hover:underline">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentlyAdded.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Section: Available for Swap */}
      {!loading && swapAvailable.length > 0 && (
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Available for Swap</h2>
              <p className="text-sm text-[var(--color-zxaaa-muted)] mt-1">Trade your items without spending cash.</p>
            </div>
            <Link to="/explore?swap=true" className="text-sm font-bold text-[var(--color-zxaaa-primary)] hover:underline">
              See All Swaps
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {swapAvailable.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Section: Best Deals (Lowest Prices) */}
      {!loading && bestDeals.length > 0 && bestDeals.length > recentlyAdded.length && (
         <div>
         <div className="flex justify-between items-end mb-6">
           <div>
             <h2 className="text-2xl font-extrabold text-white tracking-tight">Best Deals Nearby</h2>
           </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
           {bestDeals.map(p => (
             <ProductCard key={p._id} product={p} />
           ))}
         </div>
       </div>
      )}


      {/* ──────────────── 4. DEDICATED SWAP CENTER PREVIEW ──────────────── */}
      {!swapLoading && swaps.length > 0 && (
        <div className="rounded-[24px] p-8 md:p-10 relative overflow-hidden"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, var(--color-zxaaa-primary), #10b981)' }} />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)', color: 'var(--color-zxaaa-text)' }}>
                <RefreshCw size={12} /> Swap Center
              </div>
              <h2 className="text-3xl font-extrabold text-white">Swap instead of buying.</h2>
            </div>
            <Link to="/swap" className="btn-secondary px-6 py-2.5 flex items-center gap-2">
              Go to Swap Center <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {swaps.slice(0, 3).map(s => (
              <div key={s._id} className="p-5 rounded-2xl flex flex-col gap-4 relative"
                style={{ background: 'var(--color-zxaaa-card2)', border: '1px solid var(--color-zxaaa-border)' }}>
                
                <div className="flex items-center justify-between">
                   <div className="flex-1 min-w-0 bg-[var(--color-zxaaa-bg)] p-3 rounded-xl border border-[var(--color-zxaaa-border)]">
                      <p className="text-[10px] text-[var(--color-zxaaa-muted)] uppercase tracking-wider font-bold mb-1">My Product</p>
                      <p className="text-sm font-bold text-white truncate">{s.requestedProduct?.title || 'Target Product'}</p>
                   </div>
                   
                   <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 -mx-3"
                     style={{ background: 'var(--color-zxaaa-primary-bg)', border: '2px solid var(--color-zxaaa-primary)' }}>
                     <Repeat size={16} className="text-[var(--color-zxaaa-primary)]" />
                   </div>

                   <div className="flex-1 min-w-0 bg-[var(--color-zxaaa-bg)] p-3 rounded-xl border border-[var(--color-zxaaa-border)] text-right">
                      <p className="text-[10px] text-[var(--color-zxaaa-muted)] uppercase tracking-wider font-bold mb-1">Matched</p>
                      <p className="text-sm font-bold text-white truncate">{s.offeredProduct?.title || 'User Product'}</p>
                   </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-[var(--color-zxaaa-muted)] font-medium flex items-center gap-1">
                    <MapPin size={12}/> 2.4 km away
                  </span>
                  <Link to={`/swap?id=${s._id}`} className="text-xs font-bold text-[var(--color-zxaaa-primary)] hover:underline">
                    View Swap Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── 5. HOW ZXAAA WORKS ──────────────── */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-6">How ZXAAA Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { num: '01', title: 'Find Nearby', desc: 'Search for products available in your city or neighborhood.', icon: <Search size={24} className="text-[var(--color-zxaaa-primary)]" /> },
            { num: '02', title: 'Connect', desc: 'Chat directly with buyers or sellers in real-time.', icon: <MessageSquare size={24} className="text-[var(--color-zxaaa-primary)]" /> },
            { num: '03', title: 'Meet & Verify', desc: 'Meet in person locally and verify product quality.', icon: <ShieldCheck size={24} className="text-[var(--color-zxaaa-primary)]" /> },
            { num: '04', title: 'Pay & Complete', desc: 'Scan ZXAAA QR, pay securely, and get a digital receipt.', icon: <CheckCircle2 size={24} className="text-[var(--color-zxaaa-primary)]" /> },
          ].map(step => (
            <div key={step.num} className="p-6 rounded-2xl relative"
              style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
              <span className="text-4xl font-black text-white/5 absolute top-4 right-4">{step.num}</span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)' }}>
                {step.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--color-zxaaa-muted)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
