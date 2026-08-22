import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { Image as ImageIcon, Plus, Trash2, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Tag, RefreshCw } from 'lucide-react';

const SAMPLE_IMAGE_SETS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
];

const CATEGORIES = ['Electronics', 'Clothing', 'Mobiles', 'Laptops', 'Bikes & Cycles', 'Furniture', 'Books & Study', 'Sports', 'Watches', 'Home Appliances'];
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Used'];

const Sell = () => {
  const { user } = useAuth();
  const { selectedLocation } = useLocationContext();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    condition: 'Good',
    price: '',
    isSwapEnabled: false
  });

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

  const PROHIBITED_WORDS = [
    'weapon', 'gun', 'ammo', 'explosive', 'drug', 'cocaine', 'weed', 'cannabis',
    'counterfeit', 'stolen', 'hacked', 'pirated', 'exploit', 'fake currency'
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to sell a product');
      return navigate('/login');
    }
    
    setLoading(true);
    setError('');

    const textToScan = `${formData.title} ${formData.description}`.toLowerCase();
    const flaggedTerm = PROHIBITED_WORDS.find(word => textToScan.includes(word));

    if (flaggedTerm) {
      setError(`Safety Moderation Notice: Your listing contains prohibited content ("${flaggedTerm}"). ZXAAA strictly enforces safety and legal compliance.`);
      setLoading(false);
      return;
    }

    const validImages = imageUrls.map(url => url.trim()).filter(url => url.length > 0);
    const finalImages = validImages.length > 0 
      ? validImages 
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'];

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      
      const payload = {
        ...formData,
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
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white">List Your Item</h1>
        <p className="text-[var(--color-zxaaa-muted)]">Turn unused items into cash or swap them instantly.</p>
      </div>
      
      {/* Stepper Progress */}
      <div className="flex items-center justify-between relative px-4 md:px-12 mb-8">
        <div className="absolute top-1/2 left-12 right-12 h-1 bg-[var(--color-zxaaa-border)] -z-10 -translate-y-1/2 rounded-full hidden md:block">
           <div 
             className="h-full bg-[var(--color-zxaaa-primary)] rounded-full transition-all duration-300"
             style={{ width: `${((step - 1) / 2) * 100}%` }}
           />
        </div>
        {[
          { num: 1, label: 'Details', icon: <Tag size={16} /> },
          { num: 2, label: 'Pricing', icon: <MapPin size={16} /> },
          { num: 3, label: 'Media', icon: <ImageIcon size={16} /> }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step >= s.num 
                ? 'bg-[var(--color-zxaaa-primary)] text-white shadow-[0_0_12px_var(--color-zxaaa-primary-glow)] border-2 border-[var(--color-zxaaa-primary-glow)]' 
                : 'bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-muted)] border-2 border-[var(--color-zxaaa-border)]'
            }`}>
              {step > s.num ? <CheckCircle2 size={20} /> : s.num}
            </div>
            <span className={`text-xs font-bold ${step >= s.num ? 'text-white' : 'text-[var(--color-zxaaa-muted)]'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-10 rounded-[24px] shadow-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
          
          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white border-b border-[var(--color-zxaaa-border)] pb-2 mb-6">Basic Details</h2>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-white">Product Title <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sony WH-1000XM4 Wireless Headphones"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Category <span className="text-red-400">*</span></label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Condition <span className="text-red-400">*</span></label>
                  <select
                    value={formData.condition}
                    onChange={e => setFormData({...formData, condition: e.target.value})}
                    className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm"
                  >
                    {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description & Pricing */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white border-b border-[var(--color-zxaaa-border)] pb-2 mb-6">Description & Pricing</h2>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-white">Description <span className="text-red-400">*</span></label>
                <textarea 
                  required
                  rows="5"
                  placeholder="Describe features, specifications, usage duration, or warranty details..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm leading-relaxed" 
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Price (₹) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] font-bold">₹</span>
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder="2500"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl pl-10 pr-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm font-bold" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
                    <input 
                      type="text" 
                      readOnly
                      value={selectedLocation.name.split(',')[0].trim()}
                      className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl pl-10 pr-5 py-3.5 text-[var(--color-zxaaa-muted)] text-sm cursor-not-allowed opacity-70 font-bold" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[var(--color-zxaaa-border)] flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--color-zxaaa-bg)] transition-colors"
                   onClick={() => setFormData(p => ({...p, isSwapEnabled: !p.isSwapEnabled}))}>
                <div>
                  <h4 className="text-white font-bold flex items-center gap-2"><RefreshCw size={16} className="text-emerald-400"/> Accept Swaps?</h4>
                  <p className="text-xs text-[var(--color-zxaaa-muted)] mt-1">Allow other users to propose trading their items for this one.</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${formData.isSwapEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.isSwapEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Images */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center border-b border-[var(--color-zxaaa-border)] pb-2 mb-6">
                <h2 className="text-xl font-bold text-white">Product Images</h2>
                <button
                  type="button"
                  onClick={handleFillSampleImages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-zxaaa-primary)] hover:text-white bg-[var(--color-zxaaa-primary-bg)] hover:bg-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-primary-glow)] transition-all"
                >
                  <Sparkles size={14} /> Auto-fill Samples
                </button>
              </div>

              {/* Live Previews */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative group rounded-xl overflow-hidden border border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)] flex flex-col items-center justify-center h-32"
                  >
                    {url.trim() ? (
                      <>
                        <img 
                          src={url.trim()} 
                          alt={`Upload ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                          {idx === 0 ? 'Cover' : `Img ${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleClearImage(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:text-white hover:bg-rose-500 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-2 text-center text-[var(--color-zxaaa-muted)]">
                        <ImageIcon size={24} className="opacity-50" />
                        <span className="text-xs font-bold">
                          {idx === 0 ? 'Main Image' : `Image ${idx + 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* URL Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {imageUrls.map((url, idx) => (
                  <div key={idx}>
                    <input 
                      type="url" 
                      placeholder={`Image ${idx + 1} URL`}
                      value={url}
                      onChange={e => handleImageUrlChange(idx, e.target.value)}
                      className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-xs" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--color-zxaaa-border)] mt-8">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                step === 1 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-[var(--color-zxaaa-bg)] text-white hover:bg-[var(--color-zxaaa-border)] border border-[var(--color-zxaaa-border)]'
              }`}
            >
              <ChevronLeft size={18} /> Back
            </button>
            
            {step < 3 ? (
              <button
                type="submit" // Will trigger form submit which intercepts and calls handleNext
                className="btn-primary px-8 py-3 flex items-center gap-2"
              >
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3 flex items-center gap-2"
              >
                {loading ? 'Posting...' : <><CheckCircle2 size={18} /> Publish Listing</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
