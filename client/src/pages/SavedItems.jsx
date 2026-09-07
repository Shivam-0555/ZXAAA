import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export default function SavedItems() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/wishlist');
        if (!cancelled) {
          setProducts(data.data || []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load saved items');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWishlist();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--color-zxaaa-text)] flex items-center gap-2">
          <Heart size={26} className="text-rose-500 fill-rose-500" /> Saved Items
        </h1>
        <p className="text-xs md:text-sm text-[var(--color-zxaaa-muted)] mt-1 font-medium">
          Products you saved for later and price drop alerts.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-red-400 font-bold text-sm">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-[28px] bg-[var(--color-zxaaa-card)] border border-dashed border-[var(--color-zxaaa-border)] text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 mb-4">
            <ShoppingBag size={36} className="text-rose-400" />
          </div>
          <h2 className="text-xl font-black text-[var(--color-zxaaa-text)] mb-1">No Saved Items</h2>
          <p className="text-xs text-[var(--color-zxaaa-muted)] max-w-sm font-medium mb-6">
            You haven't saved any items yet. Heart items on the marketplace to save them here!
          </p>
          <Link to="/explore" className="btn-primary px-6 py-3 text-xs font-bold">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
