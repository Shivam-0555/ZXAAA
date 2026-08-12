import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    condition: 'Good',
    price: '',
    imageUrl: '',
    city: 'Vadodara'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to sell a product');
      return navigate('/login');
    }
    
    setLoading(true);
    setError('');
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
        city: formData.city,
        images: formData.imageUrl ? [formData.imageUrl] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'],
        latitude: 22.3072,
        longitude: 73.1812
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sell a Product</h1>
        <p className="text-[var(--color-zxaaa-muted)] text-sm">List an item for sale or swap in your local area</p>
      </div>
      
      <div className="glass-panel p-8 rounded-2xl border border-[var(--color-zxaaa-border)]">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Product Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Sony WH-1000XM4 Headphones"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white"
              >
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Laptops">Laptops</option>
                <option value="Bikes">Bikes</option>
                <option value="Furniture">Furniture</option>
                <option value="Books">Books</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Condition *</label>
              <select
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea 
              required
              rows="4"
              placeholder="Describe the item's features, usage history, or any defects..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" 
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹) *</label>
              <input 
                type="number" 
                required
                min="1"
                placeholder="2500"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input 
                type="text" 
                required
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white text-sm" 
            />
            {formData.imageUrl && (
              <div className="mt-2 h-32 w-32 rounded-lg overflow-hidden border border-[var(--color-zxaaa-border)]">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-6 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            {loading ? 'Submitting Product...' : '🚀 Post Product Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sell;
