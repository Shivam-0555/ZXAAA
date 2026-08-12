import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocationContext } from '../context/LocationContext';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Search, SlidersHorizontal, Package } from 'lucide-react';

const CATEGORIES = ['All', 'Mobiles', 'Laptops', 'Bikes', 'Furniture', 'Books', 'Clothes', 'Electronics'];

export default function Explore() {
  const { selectedLocation, radiusKm } = useLocationContext();
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [category, setCategory]           = useState('All');
  const [searchQ, setSearchQ]             = useState('');
  const [sort, setSort]                   = useState('newest');

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { longitude, latitude } = selectedLocation;
        const maxDistance = radiusKm * 1000;
        let url = `http://localhost:5000/api/products?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`;
        if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
        const { data } = await axios.get(url);
        let list = data.data || [];
        if (list.length === 0) {
          let fb = `http://localhost:5000/api/products`;
          if (category !== 'All') fb += `?category=${encodeURIComponent(category)}`;
          const fallback = await axios.get(fb);
          list = fallback.data.data || [];
        }
        if (!cancelled) { setProducts(list); setError(''); }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [category, selectedLocation, radiusKm]);

  const filtered = products
    .filter(p => !searchQ.trim() ||
      p.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc')  return (a.price || 0) - (b.price || 0);
      if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Explore Marketplace</h1>
        <p className="text-sm text-[var(--color-zxaaa-muted)] mt-0.5">
          Discover items near <span className="text-purple-400 font-semibold">{selectedLocation.name}</span> within {radiusKm}km
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search products..."
            className="w-full text-sm text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none transition-colors"
            style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-zxaaa-border)'}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[var(--color-zxaaa-muted)]" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm text-white py-2.5 px-3 rounded-xl focus:outline-none cursor-pointer"
            style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: category === cat ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'var(--color-zxaaa-card)',
              border: category === cat ? '1px solid rgba(124,58,237,0.5)' : '1px solid var(--color-zxaaa-border)',
              color: category === cat ? 'white' : 'var(--color-zxaaa-muted)',
              boxShadow: category === cat ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-xs text-[var(--color-zxaaa-muted)]">
          Showing <span className="text-white font-semibold">{filtered.length}</span> results
          {category !== 'All' && <> in <span className="text-purple-400 font-semibold">{category}</span></>}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <Package size={48} className="text-[var(--color-zxaaa-muted)] mb-4" />
          <p className="text-white font-bold mb-1">No products found</p>
          <p className="text-sm text-[var(--color-zxaaa-muted)]">
            Try changing category or expanding your search radius
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
