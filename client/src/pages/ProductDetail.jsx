import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Image as ImageIcon, MapPin, Tag, ShieldCheck, RefreshCw,
  MessageSquare, Zap, ArrowLeft, Maximize2, X, IndianRupee, Smartphone,
  Edit3, Trash2
} from 'lucide-react';
import RealQRCode from '../components/RealQRCode';
import UpiQRPanel from '../components/UpiQRPanel';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const [order, setOrder] = useState(null);
  const [buying, setBuying] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [buyMethod, setBuyMethod] = useState(null); // 'upi' | 'pickup'

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleBuy = async (method) => {
    if (!user) {
      alert('Please login to buy');
      return navigate('/login');
    }

    setBuying(method);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const paymentMethod = method === 'upi' ? 'Online Payment' : 'Pay at Pickup';
      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        { productId: id, paymentMethod },
        config
      );
      setBuyMethod(method);
      setOrder(data.data);
      setProduct(prev => ({ ...prev, status: 'RESERVED' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
    setBuying(null);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/products/${id}`, config);
        alert('Product deleted successfully');
        navigate('/explore');
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleEdit = () => {
    setEditData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      condition: product.condition,
      city: product.city,
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/products/${id}`, editData, config);
      setProduct(data.data);
      setIsEditing(false);
      alert('Product updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  // Verify QR (seller-side pickup handover — unchanged)
  const handleVerifyQR = async () => {
    setVerifyLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/orders/verify-qr',
        { qrReference: order.qrReference },
        config
      );
      setOrder(data.data);
      setProduct(prev => ({ ...prev, status: 'SOLD' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    }
    setVerifyLoading(false);
  };

  if (loading) return <div className="p-12 text-center text-[var(--color-zxaaa-muted)]">Loading product details...</div>;
  if (error) return <div className="p-12 text-center text-red-400 font-bold">{error}</div>;
  if (!product) return null;

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'];

  const currentMainImage = imagesList[selectedImage] || imagesList[0];
  const isOwner = user?._id === product.seller?._id;
  const isUpiOrder = buyMethod === 'upi' || order?.paymentMethod === 'Online Payment';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">

      {/* Fullscreen Lightbox */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all z-50"
          >
            <X size={22} />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={currentMainImage}
              alt={product.title}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-2 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
              {product.title} ({selectedImage + 1} / {imagesList.length})
            </span>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-zxaaa-card)] w-full max-w-lg rounded-[24px] p-6 border border-[var(--color-zxaaa-border)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[var(--color-zxaaa-text)]">Edit Product</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-[var(--color-zxaaa-card2)] transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--color-zxaaa-muted)] mb-1">Title</label>
                <input required type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] p-3 rounded-xl focus:outline-none focus:border-[var(--color-zxaaa-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-zxaaa-muted)] mb-1">Price</label>
                <input required type="number" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] p-3 rounded-xl focus:outline-none focus:border-[var(--color-zxaaa-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-zxaaa-muted)] mb-1">Category</label>
                <select value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] p-3 rounded-xl focus:outline-none focus:border-[var(--color-zxaaa-primary)]">
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-zxaaa-muted)] mb-1">Condition</label>
                <select value={editData.condition} onChange={e => setEditData({...editData, condition: e.target.value})} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] p-3 rounded-xl focus:outline-none focus:border-[var(--color-zxaaa-primary)]">
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-zxaaa-muted)] mb-1">City</label>
                <input required type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] p-3 rounded-xl focus:outline-none focus:border-[var(--color-zxaaa-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-zxaaa-muted)] mb-1">Description</label>
                <textarea required rows="4" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] p-3 rounded-xl focus:outline-none focus:border-[var(--color-zxaaa-primary)]"></textarea>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 flex justify-center items-center font-bold">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[var(--color-zxaaa-muted)] hover:text-white transition-colors mt-4">
        <ArrowLeft size={16} /> Back to Browse
      </button>

      <div className="p-6 md:p-10 rounded-[24px]" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div
              onClick={() => setIsZoomed(true)}
              className="relative h-80 sm:h-[400px] w-full rounded-2xl overflow-hidden bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] flex items-center justify-center group cursor-pointer shadow-lg"
            >
              <img src={currentMainImage} alt="" aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none" />
              <img
                src={currentMainImage}
                alt={product.title}
                className="relative z-10 max-h-full max-w-full object-contain p-2 group-hover:scale-[1.03] transition-all duration-300"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'; }}
              />
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 z-20">
                {selectedImage + 1} / {imagesList.length}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
                className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 flex items-center gap-1.5 text-xs font-bold"
              >
                <Maximize2 size={15} /> View Full
              </button>
            </div>

            {imagesList.length > 1 && (
              <div className="grid grid-cols-6 gap-3">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-[var(--color-zxaaa-card2)] flex items-center justify-center ${
                      selectedImage === idx
                        ? 'border-[var(--color-zxaaa-primary)] scale-105 shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div className="space-y-6">

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {product.status === 'SOLD' && (
                  <div className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-3 py-1 rounded-full text-xs">🔴 SOLD OUT</div>
                )}
                {product.status === 'RESERVED' && (
                  <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-full text-xs">🟡 RESERVED</div>
                )}
                {product.isSwapEnabled && (
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <RefreshCw size={12} /> SWAP AVAILABLE
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-zxaaa-text)] leading-tight">{product.title}</h1>

              <div className="text-4xl font-black text-[var(--color-zxaaa-text)]">
                ₹{product.price?.toLocaleString('en-IN')}
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-zxaaa-primary-bg)] text-[var(--color-zxaaa-text)] border border-[var(--color-zxaaa-primary-glow)] flex items-center gap-1.5">
                  <Tag size={14} /> {product.category}
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-text)] border border-[var(--color-zxaaa-border)]">
                  {product.condition} condition
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-muted)] border border-[var(--color-zxaaa-border)] flex items-center gap-1.5">
                  <MapPin size={14} /> {product.city || 'Vadodara'}
                </span>
              </div>

              {/* Seller Box */}
              <div className="p-4 rounded-[16px] flex items-center gap-4" style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-[var(--color-zxaaa-text)] shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary), #2563eb)' }}>
                  {product.seller?.name?.charAt(0) ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--color-zxaaa-muted)] font-bold uppercase tracking-wider mb-0.5">Listed By</div>
                  <div className="font-bold text-[var(--color-zxaaa-text)] text-base truncate">{product.seller?.name ?? 'Verified Seller'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-[var(--color-zxaaa-muted)] font-bold uppercase tracking-wider mb-0.5">Trust Score</div>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1 justify-end">
                    <ShieldCheck size={14} /> {product.seller?.trustScore ?? '95'}/100
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--color-zxaaa-text)] mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-[var(--color-zxaaa-muted)] text-sm leading-relaxed whitespace-pre-line">
                  {product.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* ── Buy Actions ── */}
            {product.status === 'ACTIVE' && !isOwner && !order && (
              <div className="mt-8 space-y-3">
                {/* Pay via UPI */}
                <button
                  id="btn-buy-upi"
                  onClick={() => handleBuy('upi')}
                  disabled={!!buying}
                  className="w-full py-4 text-base flex justify-center items-center gap-2 rounded-2xl font-black text-white transition-all hover:scale-[1.01] hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 18px rgba(124,58,237,0.4)' }}
                >
                  {buying === 'upi' ? 'Processing...' : <><Smartphone size={18} /> Pay via UPI</>}
                </button>

                {/* Pay at Pickup */}
                <button
                  id="btn-buy-pickup"
                  onClick={() => handleBuy('pickup')}
                  disabled={!!buying}
                  className="w-full btn-secondary py-3.5 flex justify-center items-center gap-2"
                >
                  {buying === 'pickup' ? 'Processing...' : <><Zap size={16} /> Pay at Pickup</>}
                </button>

                {/* Chat / Swap */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const sellerId = product.seller?._id || product.seller;
                      const sellerName = product.seller?.name || 'Seller';
                      navigate(`/messages?seller=${sellerId}&sellerName=${encodeURIComponent(sellerName)}&product=${product._id}&title=${encodeURIComponent(product.title)}`);
                    }}
                    className="flex-1 btn-secondary py-3 flex justify-center items-center gap-2"
                  >
                    <MessageSquare size={16} /> Chat with Seller
                  </button>
                  {product.isSwapEnabled && (
                    <Link
                      to={`/swap?id=${product._id}`}
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-emerald-400 transition-all border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      <RefreshCw size={16} /> Propose Swap
                    </Link>
                  )}
                </div>
              </div>
            )}

            {isOwner && (
              <div className="mt-8 p-6 rounded-2xl bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] space-y-4">
                <p className="text-sm text-[var(--color-zxaaa-text)] font-black uppercase tracking-wider text-center flex items-center justify-center gap-2">
                  <ShieldCheck size={16} className="text-[var(--color-zxaaa-primary)]" /> This is your listing
                </p>
                {product.status !== 'SOLD' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="flex-1 btn-secondary py-3 flex justify-center items-center gap-2 border-[var(--color-zxaaa-primary-glow)] hover:bg-[var(--color-zxaaa-primary-bg)]"
                    >
                      <Edit3 size={16} /> Edit Product
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 btn-secondary py-3 flex justify-center items-center gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      <Trash2 size={16} /> Delete Product
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-center text-[var(--color-zxaaa-muted)]">
                    This product has been sold and can no longer be edited or deleted.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Transaction / Payment Panel ── */}
      {order && product.status !== 'SOLD' && (
        <div>
          {isUpiOrder ? (
            /* UPI QR Panel */
            <UpiQRPanel 
              order={order} 
              onPaymentComplete={(updatedOrder) => {
                setOrder(updatedOrder);
                setProduct(prev => ({ ...prev, status: 'SOLD' }));
              }} 
            />
          ) : (
            /* Pickup QR Panel (unchanged) */
            <div className="p-8 rounded-[24px] border border-[var(--color-zxaaa-primary)] space-y-6 relative overflow-hidden" style={{ background: 'var(--color-zxaaa-card)' }}>
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, var(--color-zxaaa-primary), #3b82f6)' }} />
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                  style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)', color: 'var(--color-zxaaa-text)' }}>
                  <ShieldCheck size={12} /> Secure Pickup Transaction
                </div>
                <h2 className="text-3xl font-black text-[var(--color-zxaaa-text)]">Order Reserved!</h2>
                <p className="text-sm text-[var(--color-zxaaa-muted)] mt-2 max-w-xl">
                  Show this QR code to the seller during your in-person meetup. The seller will scan it to complete the handover.
                </p>
              </div>

              <div className="flex justify-center my-8">
                <RealQRCode
                  value={order.qrReference}
                  title="Buyer Pick-Up QR Code"
                  subtitle={`Order ID: ${order.orderId}`}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Completed Receipt / Digital Bill ── */}
      {product.status === 'SOLD' && order && (
        <div className="p-8 rounded-[24px] border-2 border-emerald-500/50 bg-emerald-500/10 text-center shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
          {/* Background flourish */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40 relative z-10">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-emerald-400 mb-2 relative z-10">Transaction Completed!</h2>
          <p className="text-base text-white font-bold mb-6 relative z-10">Your digital bill has been generated.</p>
          
          <div className="inline-block text-left bg-black/60 p-6 md:p-8 rounded-2xl border border-emerald-500/30 space-y-3 shadow-xl relative z-10 w-full max-w-md">
            <div className="border-b border-white/10 pb-4 mb-4 text-center">
              <p className="text-[10px] text-[var(--color-zxaaa-muted)] uppercase tracking-wider font-bold">Total Paid</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">₹{order.amount?.toLocaleString('en-IN')}</p>
            </div>
            
            <p className="text-sm flex justify-between"><span className="font-bold text-[var(--color-zxaaa-muted)]">Order ID</span> <span className="font-mono text-white">{order.orderId}</span></p>
            <p className="text-sm flex justify-between"><span className="font-bold text-[var(--color-zxaaa-muted)]">Payment Method</span> <span className="text-white">{order.paymentMethod}</span></p>
            <p className="text-sm flex justify-between"><span className="font-bold text-[var(--color-zxaaa-muted)]">Seller</span> <span className="text-white">{product.seller?.name || 'Seller'}</span></p>
            <p className="text-sm flex justify-between"><span className="font-bold text-[var(--color-zxaaa-muted)]">Status</span> <span className="text-emerald-400 font-bold flex items-center gap-1"><Check size={14}/> VERIFIED</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

