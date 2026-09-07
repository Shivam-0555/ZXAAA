import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useLocationContext } from '../context/LocationContext';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import SearchAutocomplete from '../components/SearchAutocomplete';
import SeoHead from '../components/SeoHead';
import { Search, SlidersHorizontal, Package, RefreshCw, X, Filter, IndianRupee } from 'lucide-react';

const CATEGORIES = [
  'All', 'Clothing', 'Electronics', 'Mobiles', 'Laptops', 'Tablets',
  'Cameras', 'Gaming', 'Furniture', 'Books & Study', 'Bikes & Cycles',
  'Watches', 'Fashion', 'Home & Appliances', 'Sports', 'Tools', 'Accessories'
];

const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair', 'Used'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || searchParams.get('cat') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSwap = searchParams.get('swap') === 'true';
  const initialCondition = searchParams.get('condition') || 'All';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';

  const { selectedLocation } = useLocationContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [category, setCategory] = useState(initialCat === 'all' ? 'All' : initialCat);
  const [searchQ, setSearchQ] = useState(initialSearch);
  const [sort, setSort] = useState('newest');
  const [swapOnly, setSwapOnly] = useState(initialSwap);
  const [condition, setCondition] = useState(initialCondition);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const catFromUrl = searchParams.get('category') || searchParams.get('cat');
    if (catFromUrl) setCategory(catFromUrl === 'all' ? 'All' : catFromUrl);
    
    const qFromUrl = searchParams.get('search');
    if (qFromUrl !== null) setSearchQ(qFromUrl);
    
    const swapFromUrl = searchParams.get('swap');
    if (swapFromUrl !== null) setSwapOnly(swapFromUrl === 'true');

    const condFromUrl = searchParams.get('condition');
    if (condFromUrl !== null) setCondition(condFromUrl);

    const minFromUrl = searchParams.get('minPrice');
    if (minFromUrl !== null) setMinPrice(minFromUrl);

    const maxFromUrl = searchParams.get('maxPrice');
    if (maxFromUrl !== null) setMaxPrice(maxFromUrl);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cityName = selectedLocation?.name ? selectedLocation.name.split(',')[0].trim() : 'Vadodara';
        let params = new URLSearchParams();
        
        if (cityName) params.append('city', cityName);
        if (category !== 'All') params.append('category', category);
        if (searchQ.trim()) params.append('keyword', searchQ.trim());
        if (condition !== 'All') params.append('condition', condition);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (swapOnly) params.append('swap', 'true');
        if (sort) params.append('sort', sort);

        const { data } = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
        if (!cancelled) {
          setProducts(data.data || []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [category, searchQ, condition, minPrice, maxPrice, swapOnly, sort, selectedLocation]);

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
    updateSearchParams('swap', newVal ? 'true' : null);
  };

  const handleClearFilters = () => {
    setCategory('All');
    setSearchQ('');
    setSwapOnly(false);
    setCondition('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
  };

  const currentCityName = selectedLocation?.name ? selectedLocation.name.split(',')[0].trim() : 'Vadodara';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* SEO Head Metadata */}
      <SeoHead
        title={`Explore Marketplace in ${currentCityName} - Buy & Swap on ZXAAA`}
        description={`Browse pre-loved items, laptops, mobiles, furniture, and books available in ${currentCityName} with verified sellers and instant QR handover.`}
        keywords={`marketplace, ${currentCityName}, used electronics, buy laptops, swap deals, ZXAAA`}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[var(--color-zxaaa-text)]">Explore Marketplace</h1>
        <p className="text-sm text-[var(--color-zxaaa-muted)] mt-1">
          Discover items near <span className="text-[var(--color-zxaaa-primary)] font-bold">{currentCityName}</span>
        </p>
      </div>

      {/* Main Search & Filters Card */}
      <div className="p-4 md:p-6 rounded-[24px] space-y-4" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        
        {/* Top Search Bar & Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchAutocomplete placeholder="Search products, brands or categories..." />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Advanced Filter Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                showAdvancedFilters || minPrice || maxPrice || condition !== 'All'
                  ? 'border-[var(--color-zxaaa-primary-glow)] bg-[var(--color-zxaaa-primary-bg)] text-[var(--color-zxaaa-primary)]'
                  : 'border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-card2)] text-[var(--color-zxaaa-muted)] hover:text-[var(--color-zxaaa-text)]'
              }`}
            >
              <Filter size={15} />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] pointer-events-none" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs font-bold text-[var(--color-zxaaa-text)] py-2.5 pl-8 pr-7 rounded-full focus:outline-none cursor-pointer appearance-none bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)]"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>

            {/* Swaps Only Button */}
            <button
              onClick={handleSwapToggle}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                swapOnly 
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                  : 'border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-card2)] text-[var(--color-zxaaa-muted)] hover:text-[var(--color-zxaaa-text)]'
              }`}
            >
              <RefreshCw size={14} />
              <span>Swaps Only</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters (Price Range & Condition) */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-2xl bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Condition Filter */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-zxaaa-muted)] mb-1.5 uppercase tracking-wider">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => {
                    setCondition(e.target.value);
                    updateSearchParams('condition', e.target.value);
                  }}
                  className="w-full text-xs font-bold text-[var(--color-zxaaa-text)] p-2.5 rounded-xl bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] focus:outline-none"
                >
                  {CONDITIONS.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-zxaaa-muted)] mb-1.5 uppercase tracking-wider">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    updateSearchParams('minPrice', e.target.value);
                  }}
                  className="w-full text-xs font-bold text-[var(--color-zxaaa-text)] p-2.5 rounded-xl bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-zxaaa-muted)] mb-1.5 uppercase tracking-wider">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    updateSearchParams('maxPrice', e.target.value);
                  }}
                  className="w-full text-xs font-bold text-[var(--color-zxaaa-text)] p-2.5 rounded-xl bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] focus:outline-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* Category Pills Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-[var(--color-zxaaa-primary-bg)] border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]' 
                    : 'bg-[var(--color-zxaaa-card2)] border-[var(--color-zxaaa-border)] text-[var(--color-zxaaa-muted)] hover:text-[var(--color-zxaaa-text)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header & Active Filters Bar */}
      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
          <p className="text-xs text-[var(--color-zxaaa-muted)] font-bold">
            Found <span className="text-[var(--color-zxaaa-text)] font-extrabold text-sm">{products.length}</span> verified results in <span className="text-[var(--color-zxaaa-primary)]">{currentCityName}</span>
          </p>

          {(category !== 'All' || searchQ || swapOnly || condition !== 'All' || minPrice || maxPrice) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-zxaaa-muted)]">Active Filters</span>
              <button 
                onClick={handleClearFilters}
                className="text-xs font-black text-red-400 hover:underline px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl text-center bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 font-bold text-sm">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-[28px] bg-[var(--color-zxaaa-card)] border border-dashed border-[var(--color-zxaaa-border)]">
          <Package size={56} className="text-[var(--color-zxaaa-muted)] mb-3 opacity-40" />
          <h3 className="text-xl font-black text-[var(--color-zxaaa-text)] mb-1">No matching products found</h3>
          <p className="text-xs text-[var(--color-zxaaa-muted)] max-w-sm text-center font-medium">
            We couldn't find any items matching your active search criteria in {currentCityName}. Try clearing filters or searching another keyword.
          </p>
          <button 
            onClick={handleClearFilters}
            className="mt-5 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[var(--color-zxaaa-primary)] hover:scale-105 transition-all shadow-[0_4px_16px_var(--color-zxaaa-primary-glow)]"
          >
            Clear Filters & Search Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
