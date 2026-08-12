import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Tag } from 'lucide-react';

// Category emoji map
const CAT_ICONS = {
  Mobiles: '📱', Laptops: '💻', Bikes: '🏍️', Furniture: '🪑',
  Books: '📚', Clothes: '👕', Electronics: '⚡', Default: '📦',
};

function ProductImageFallback({ category }) {
  const icon = CAT_ICONS[category] || CAT_ICONS.Default;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg, #111318, #181a22)' }}>
      <span className="text-4xl">{icon}</span>
      <span className="text-xs text-[var(--color-zxaaa-muted)] font-medium">{category || 'Item'}</span>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ height: 180 }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex justify-between mt-3">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-5 w-12" />
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product, compact = false }) {
  const [imgErr, setImgErr] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!product) return null;

  const imgSrc = product.images?.[0];
  const rating = product.seller?.rating || (4.2 + Math.random() * 0.7).toFixed(1);

  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="product-card group">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: compact ? 140 : 180 }}>
          {imgSrc && !imgErr ? (
            <img
              src={imgSrc}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgErr(true)}
            />
          ) : (
            <ProductImageFallback category={product.category} />
          )}

          {/* Status badge */}
          {product.status === 'SOLD' && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">SOLD</span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={e => { e.preventDefault(); setLiked(l => !l); }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: liked ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Heart size={14} fill={liked ? 'white' : 'none'} stroke={liked ? 'transparent' : 'white'} />
          </button>

          {/* Category tag */}
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: '#c4b5fd' }}>
              {product.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="font-semibold text-[var(--color-zxaaa-text)] text-sm leading-tight truncate group-hover:text-purple-300 transition-colors mb-1">
            {product.title}
          </h3>

          {/* Seller & Rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[var(--color-zxaaa-muted)] flex items-center gap-1">
              <Tag size={10} />
              {product.seller?.name || 'Seller'}
            </span>
            <span className="text-[11px] flex items-center gap-0.5 text-amber-400">
              <Star size={10} fill="currentColor" />
              {typeof rating === 'number' ? rating.toFixed(1) : rating}
            </span>
          </div>

          {/* Price + Distance */}
          <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-zxaaa-border)]">
            <span className="text-base font-bold text-emerald-400">₹{product.price?.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-[var(--color-zxaaa-muted)] flex items-center gap-0.5">
              <MapPin size={9} />
              {product.condition || 'Nearby'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
