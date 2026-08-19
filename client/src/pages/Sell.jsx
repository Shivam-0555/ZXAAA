import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { Image as ImageIcon, Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

const SAMPLE_IMAGE_SETS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
];

const Sell = () => {
  const { user } = useAuth();
  const { selectedLocation } = useLocationContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    condition: 'Good',
    price: ''
  });

  // Array of 6 image URLs
  const [imageUrls, setImageUrls] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleClearImage = (index) => {
    const newUrls = [...imageUrls];
    newUrls[index] = '';
    setImageUrls(newUrls);
  };

  const handleFillSampleImages = () => {
    setImageUrls([...SAMPLE_IMAGE_SETS]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to sell a product');
      return navigate('/login');
    }
    
    setLoading(true);
    setError('');

    // Filter out blank URLs
    const validImages = imageUrls.map(url => url.trim()).filter(url => url.length > 0);
    
    // Fallback if no images provided
    const finalImages = validImages.length > 0 
      ? validImages 
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'];

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        city: selectedLocation.name.split(',')[0].trim(),
        images: finalImages,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      };
      
      await axios.post('http://localhost:5000/api/products', payload, config);
      navigate('/explore');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create product listing');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black gradient-text">Sell a Product</h1>
        <p className="text-[var(--color-zxaaa-muted)] text-sm mt-1">List your item with up to 6 high quality product photos</p>
      </div>
      
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--color-zxaaa-border)] shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-white">Product Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Sony WH-1000XM4 Wireless Headphones"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white text-sm" 
            />
          </div>
          
          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-white">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white text-sm"
              >
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Laptops">Laptops</option>
                <option value="Bikes & Cycles">Bikes & Cycles</option>
                <option value="Furniture">Furniture</option>
                <option value="Books & Study">Books & Study</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-white">Condition *</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white text-sm"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-white">Description *</label>
            <textarea 
              required
              rows="4"
              placeholder="Describe features, specifications, usage duration, or warranty details..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white text-sm leading-relaxed" 
            ></textarea>
          </div>
          
          {/* Price & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-white">Price (₹) *</label>
              <input 
                type="number" 
                required
                min="1"
                placeholder="2500"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white text-sm font-semibold" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-white">City *</label>
              <input 
                type="text" 
                readOnly
                value={selectedLocation.name.split(',')[0].trim()}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 text-[var(--color-zxaaa-muted)] text-sm cursor-not-allowed opacity-70" 
              />
              <p className="text-[10px] text-[var(--color-zxaaa-muted)] mt-1 ml-1">Location set from your current city selection</p>
            </div>
          </div>

          {/* 6 Image URLs Section */}
          <div className="space-y-4 pt-2 border-t border-[var(--color-zxaaa-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon size={18} className="text-purple-400" />
                  Product Images (Up to 6 URLs)
                </label>
                <p className="text-xs text-[var(--color-zxaaa-muted)]">
                  Add image URLs for your item. Image 1 is the main cover image.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFillSampleImages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all self-start sm:self-auto"
              >
                <Sparkles size={14} /> Auto-fill 6 Sample Images
              </button>
            </div>

            {/* Live 6 Image Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imageUrls.map((url, idx) => (
                <div 
                  key={idx} 
                  className="relative group rounded-xl overflow-hidden border border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)] flex flex-col items-center justify-center h-32"
                >
                  {url.trim() ? (
                    <>
                      <img 
                        src={url.trim()} 
                        alt={`Product Image ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-purple-300 backdrop-blur-md border border-white/10">
                        {idx === 0 ? 'Cover Image' : `Image ${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleClearImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:text-rose-200 hover:bg-rose-600/80 backdrop-blur-md transition-all"
                        title="Remove Image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                      <ImageIcon size={22} className="text-[var(--color-zxaaa-muted)] opacity-50" />
                      <span className="text-[11px] font-semibold text-[var(--color-zxaaa-muted)]">
                        {idx === 0 ? 'Image 1 (Main)' : `Image ${idx + 1}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 6 Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {imageUrls.map((url, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-medium mb-1 text-[var(--color-zxaaa-muted)]">
                    Image {idx + 1} URL {idx === 0 && '(Main Cover)'}
                  </label>
                  <input 
                    type="url" 
                    placeholder={`https://images.unsplash.com/...`}
                    value={url}
                    onChange={e => handleImageUrlChange(idx, e.target.value)}
                    className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white text-xs" 
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-8 shadow-[0_0_25px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting Product...' : <>🚀 Post Product Listing</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sell;
