import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, ShieldCheck, RefreshCw } from 'lucide-react';

// Category emoji map
const CAT_ICONS = {
  Mobiles: '📱', Laptops: '💻', Bikes: '🏍️', 'Bikes & Cycles': '🏍️',
  Furniture: '🪑', Books: '📚', 'Books & Study': '📚', Clothes: '👕',
  Clothing: '👕', Electronics: '⚡', Sports: '⚽', Watches: '⌚',
  'Home Appliances': '🏠', Default: '📦',
};

function ProductImageFallback({ category }) {
  const icon = CAT_ICONS[category] || CAT_ICONS.Default;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-bg), var(--color-zxaaa-card))' }}>
      <span className="text-5xl">{icon}</span>
      <span className="text-xs text-[var(--color-zxaaa-muted)] font-bold">{category || 'Item'}</span>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ height: 200 }} />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="flex justify-between mt-4">
          <div className="skeleton h-5 w-20 rounded-lg" />
          <div className="skeleton h-5 w-14 rounded-lg" />
        </div>
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-8 flex-1 rounded-xl" />
          <div className="skeleton h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product, compact = false, onSwapClick }) {
  const [imgErr, setImgErr] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!product) return null;

  const imgSrc = product.images?.[0];
  const rating = product.seller?.rating || (4.5 + (product.title?.length % 5) * 0.1).toFixed(1);
  const distanceKm = product.distanceKm || ((product.title?.length % 8) * 0.6 + 0.8).toFixed(1);
  const sellerName = product.seller?.name || product.sellerName || 'Verified Seller';
  const conditionText = product.condition || 'Good condition';
  const isSwapEnabled = product.isSwapEnabled || product.acceptsSwap;

  return (
    <div className="product-card group relative flex flex-col justify-between h-full">
      <Link to={`/product/${product._id}`} className="block flex-1">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-[inherit]" style={{ height: compact ? 160 : 195 }}>
          {imgSrc && !imgErr ? (
            <img
              src={imgSrc}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
              onError={() => setImgErr(true)}
            />
          ) : (
            <ProductImageFallback category={product.category} />
          )}

          {/* SOLD overlay */}
          {product.status === 'SOLD' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="bg-red-600 text-white font-extrabold px-5 py-2 rounded-full text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)] rotate-[-10deg]">
                SOLD
              </span>
            </div>
          )}

          {/* RESERVED overlay */}
          {product.status === 'RESERVED' && (
            <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-amber-500 text-white font-extrabold px-5 py-2 rounded-full text-xs uppercase tracking-widest shadow-lg">
                RESERVED
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setLiked(l => !l);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 hover:scale-110 active:scale-95"
            style={{
              background: liked ? 'rgba(239,68,68,0.95)' : 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: liked ? '0 0 14px rgba(239,68,68,0.5)' : 'none',
            }}
          >
            <Heart size={14} fill={liked ? 'white' : 'none'} stroke={liked ? 'transparent' : 'white'} />
          </button>

          {/* Bottom Badges */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
            <span className="flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-1 rounded-full text-white"
              style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(6px)' }}>
              <ShieldCheck size={10} /> Verified
            </span>
            {isSwapEnabled && (
              <span className="flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-1 rounded-full text-white"
                style={{ background: 'var(--color-zxaaa-primary)', backdropFilter: 'blur(6px)' }}>
                <RefreshCw size={10} /> Swap
              </span>
            )}
          </div>
        </div>

        {/* Info Container */}
        <div className="p-4 flex flex-col gap-3">
          {/* Title & Condition */}
          <div>
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-[var(--color-zxaaa-text)] transition-colors">
              {product.title}
            </h3>
            <p className="text-[11px] text-[var(--color-zxaaa-muted)] mt-1 font-medium">
              {conditionText} · {product.category}
            </p>
          </div>

          {/* Price & Distance */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white leading-none">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[var(--color-zxaaa-muted)] font-bold flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-zxaaa-border)' }}>
              <MapPin size={9} className="text-rose-400" />
              {distanceKm} km
            </span>
          </div>

          {/* Seller & Rating Row */}
          <div className="pt-3 border-t border-[var(--color-zxaaa-border)] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary), #2563eb)' }}>
                {sellerName.charAt(0)}
              </div>
              <span className="text-[11px] text-[var(--color-zxaaa-muted)] truncate max-w-[90px] font-medium">
                {sellerName}
              </span>
            </div>
            <span className="text-[11px] flex items-center gap-1 text-amber-400 font-bold shrink-0">
              <Star size={11} fill="currentColor" /> {rating}
            </span>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          to={`/product/${product._id}`}
          className="flex-1 py-2 text-center text-xs font-bold rounded-[10px] text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: 'var(--color-zxaaa-primary)', boxShadow: '0 2px 12px var(--color-zxaaa-primary-glow)' }}>
          View
        </Link>
        {isSwapEnabled ? (
          <Link
            to={`/swap?id=${product._id}`}
            className="flex-1 py-2 text-center text-xs font-bold rounded-[10px] transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
            <RefreshCw size={12} /> Swap
          </Link>
        ) : (
          <Link
            to={`/messages?seller=${product.seller?._id || product.seller || ''}&sellerName=${encodeURIComponent(sellerName)}&product=${product._id}&title=${encodeURIComponent(product.title)}`}
            className="flex-1 py-2 text-center text-xs font-bold rounded-[10px] text-[var(--color-zxaaa-muted)] transition-all hover:text-white hover:-translate-y-0.5 active:translate-y-0"
            style={{ border: '1px solid var(--color-zxaaa-border)', background: 'rgba(255,255,255,0.03)' }}>
            Chat
          </Link>
        )}
      </div>
    </div>
  );
}
