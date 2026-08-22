import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useLocationContext } from '../context/LocationContext';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Search, SlidersHorizontal, Package, RefreshCw, X } from 'lucide-react';

const CATEGORIES = ['All', 'Mobiles', 'Laptops', 'Bikes', 'Furniture', 'Books', 'Clothes', 'Electronics', 'Home Appliances', 'Study Items', 'Watches', 'Sports'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || searchParams.get('cat') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSwap = searchParams.get('swap') === 'true';

  const { selectedLocation, radiusKm } = useLocationContext();
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [category, setCategory]           = useState(initialCat === 'all' ? 'All' : initialCat);
  const [searchQ, setSearchQ]             = useState(initialSearch);
  const [sort, setSort]                   = useState('newest');
  const [swapOnly, setSwapOnly]           = useState(initialSwap);

  useEffect(() => {
    const catFromUrl = searchParams.get('category') || searchParams.get('cat');
    if (catFromUrl) {
      setCategory(catFromUrl === 'all' ? 'All' : catFromUrl);
    }
    const qFromUrl = searchParams.get('search');
    if (qFromUrl !== null) {
      setSearchQ(qFromUrl);
    }
    const swapFromUrl = searchParams.get('swap');
    if (swapFromUrl !== null) {
      setSwapOnly(swapFromUrl === 'true');
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cityName = selectedLocation?.name ? selectedLocation.name.split(',')[0].trim() : 'Vadodara';
        let url = `http://localhost:5000/api/products?city=${encodeURIComponent(cityName)}`;
        if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
        const { data } = await axios.get(url);
        let list = data.data || [];
        if (!cancelled) { setProducts(list); setError(''); }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [category, selectedLocation]);

  const filtered = products
    .filter(p => !searchQ.trim() ||
      p.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQ.toLowerCase()))
    .filter(p => !swapOnly || p.isSwapEnabled)
    .sort((a, b) => {
      if (sort === 'price-asc')  return (a.price || 0) - (b.price || 0);
      if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  const updateSearchParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    updateSearchParams('category', cat);
  };

  const handleSwapToggle = () => {
    const newVal = !swapOnly;
    setSwapOnly(newVal);
    if (newVal) {
      updateSearchParams('swap', 'true');
    } else {
      updateSearchParams('swap', null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Explore Marketplace</h1>
        <p className="text-sm text-[var(--color-zxaaa-muted)] mt-1">
          Discover items near <span className="text-[var(--color-zxaaa-primary)] font-bold">{selectedLocation?.name || 'your location'}</span>
        </p>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-[20px] space-y-4" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        
        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
            <input
              type="text"
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); updateSearchParams('search', e.target.value); }}
              placeholder="Search products, brands, or categories..."
              className="w-full text-sm text-white pl-11 pr-10 py-3 rounded-xl focus:outline-none transition-colors"
              style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-zxaaa-primary-glow)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-zxaaa-border)'}
            />
            {searchQ && (
              <button onClick={() => { setSearchQ(''); updateSearchParams('search', null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] pointer-events-none" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm text-white py-3 pl-9 pr-8 rounded-xl focus:outline-none cursor-pointer appearance-none min-w-[150px]"
                style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)' }}
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
            <button
              onClick={handleSwapToggle}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0 border ${
                swapOnly 
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                  : 'border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-muted)] hover:text-white'
              }`}
            >
              <RefreshCw size={16} />
              <span>Swaps Only</span>
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-[var(--color-zxaaa-primary-bg)] border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]' 
                    : 'bg-[var(--color-zxaaa-bg)] border-[var(--color-zxaaa-border)] text-[var(--color-zxaaa-muted)] hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count & Active Filters */}
      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-zxaaa-muted)]">
            Found <span className="text-white font-extrabold">{filtered.length}</span> results
          </p>
          {(category !== 'All' || searchQ || swapOnly) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-zxaaa-muted)]">Active Filters:</span>
              <button 
                onClick={() => { setCategory('All'); setSearchQ(''); setSwapOnly(false); setSearchParams({}); }}
                className="text-xs font-bold text-red-400 hover:underline px-2 py-1 rounded bg-red-400/10"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-[24px]"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px dashed var(--color-zxaaa-border)' }}>
          <Package size={64} className="text-[var(--color-zxaaa-muted)] mb-4 opacity-50" />
          <h3 className="text-2xl font-black text-white mb-2">No products found</h3>
          <p className="text-sm text-[var(--color-zxaaa-muted)] max-w-sm text-center">
            We couldn't find any items matching your current filters in {selectedLocation?.name.split(',')[0]}.
          </p>
          <button 
            onClick={() => { setCategory('All'); setSearchQ(''); setSwapOnly(false); setSearchParams({}); }}
            className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white transition-all bg-[var(--color-zxaaa-primary)] hover:scale-105 shadow-[0_4px_16px_var(--color-zxaaa-primary-glow)]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}

