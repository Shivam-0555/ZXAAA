import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedItems() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/[0.02] border border-white/[0.05] mb-6">
        <ShoppingBag size={32} className="text-[var(--color-zxaaa-muted)]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">No Saved Items</h2>
      <p className="text-[var(--color-zxaaa-muted)] text-sm mb-6 max-w-sm text-center">
        You haven't saved any items yet. Explore the marketplace to find items you love!
      </p>
      <Link to="/explore" className="px-6 py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: 'var(--color-zxaaa-purple)' }}>
        Explore Now
      </Link>
    </div>
  );
}
