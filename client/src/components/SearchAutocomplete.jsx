import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocationContext } from '../context/LocationContext';
import { Search, X, Loader2, Sparkles, Tag, ArrowRight } from 'lucide-react';

export default function SearchAutocomplete({ placeholder = "Search products, brands or categories..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [matchingProducts, setMatchingProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { selectedLocation } = useLocationContext();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const cityName = selectedLocation?.name ? selectedLocation.name.split(',')[0].trim() : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setMatchingProducts([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let url = `http://localhost:5000/api/products/search/suggestions?q=${encodeURIComponent(query.trim())}`;
        if (cityName) url += `&city=${encodeURIComponent(cityName)}`;

        const { data } = await axios.get(url);
        if (data.success) {
          setSuggestions(data.suggestions || []);
          setMatchingProducts(data.products || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, cityName]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectSuggestion = (tagText) => {
    setQuery(tagText);
    setIsOpen(false);
    navigate(`/explore?search=${encodeURIComponent(tagText)}`);
  };

  const handleSelectProduct = (product) => {
    setIsOpen(false);
    const identifier = product.slug || product._id;
    navigate(`/product/${identifier}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full text-sm text-[var(--color-zxaaa-text)] placeholder:text-[var(--color-zxaaa-muted)] pl-12 pr-10 py-2.5 rounded-full focus:outline-none transition-all bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] focus:border-[var(--color-zxaaa-primary)] focus:shadow-[0_0_0_1px_var(--color-zxaaa-primary-bg)] font-medium"
        />
        {loading ? (
          <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-primary)] animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] hover:text-[var(--color-zxaaa-text)]"
          >
            <X size={16} />
          </button>
        ) : null}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] shadow-2xl overflow-hidden animate-fadeIn backdrop-blur-xl">
          
          {/* Keyword Suggestion Pills */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-[var(--color-zxaaa-border)]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-zxaaa-muted)] mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-[var(--color-zxaaa-primary)]" /> Quick Suggestions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--color-zxaaa-card2)] text-[var(--color-zxaaa-text)] hover:bg-[var(--color-zxaaa-primary-bg)] hover:text-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-border)] transition-colors flex items-center gap-1"
                  >
                    <Tag size={10} /> {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Items List */}
          {matchingProducts.length > 0 ? (
            <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
              <p className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-[var(--color-zxaaa-muted)]">
                Matching Listings
              </p>
              {matchingProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleSelectProduct(p)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-zxaaa-card2)] cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/10 border border-white/10 flex items-center justify-center">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--color-zxaaa-text)] truncate group-hover:text-[var(--color-zxaaa-primary)] transition-colors">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-zxaaa-muted)]">
                      <span>{p.category}</span>
                      <span>•</span>
                      <span>{p.city}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[var(--color-zxaaa-text)] shrink-0">
                    ₹{p.price?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : !loading && suggestions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--color-zxaaa-muted)]">
              No matching products found for "{query}"
            </div>
          ) : null}

          {/* Footer view all results link */}
          <button
            onClick={handleSearchSubmit}
            className="w-full py-2.5 px-4 bg-[var(--color-zxaaa-card2)] hover:bg-[var(--color-zxaaa-primary-bg)] text-xs font-bold text-[var(--color-zxaaa-text)] hover:text-[var(--color-zxaaa-primary)] border-t border-[var(--color-zxaaa-border)] flex items-center justify-between transition-colors"
          >
            <span>Search all for "{query}"</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
