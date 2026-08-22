import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, MapPin, Tag, ShieldCheck, RefreshCw, MessageSquare, Zap, ArrowLeft } from 'lucide-react';
import RealQRCode from '../components/RealQRCode';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const [order, setOrder] = useState(null);
  const [buying, setBuying] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

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

  const handleBuy = async () => {
    if (!user) {
      alert('Please login to buy');
      return navigate('/login');
    }

    setBuying(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        { productId: id, paymentMethod: 'Pay at Pickup' },
        config
      );
      setOrder(data.data);
      setProduct(prev => ({ ...prev, status: 'RESERVED' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
    setBuying(false);
  };

  useEffect(() => {
    if (order && order.qrReference) {
      import('qrcode')
        .then(QRCode => QRCode.toDataURL(order.qrReference))
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR generation error', err));
    }
  }, [order]);

  const handleVerifyQR = async () => {
    setVerifyLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/orders/verify-qr',
        { qrReference: order.qrReference },
        config
      );
      alert('Transaction Verified! Receipt Generated.');
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[var(--color-zxaaa-muted)] hover:text-white transition-colors mt-4">
        <ArrowLeft size={16} /> Back to Browse
      </button>

      <div className="p-6 md:p-10 rounded-[24px]" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Interactive Viewer Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            {/* Main Display Image */}
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)]">
              <img
                src={currentMainImage}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop';
                }}
              />
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                {selectedImage + 1} / {imagesList.length}
              </span>
            </div>

            {/* Thumbnail Grid */}
            {imagesList.length > 1 && (
              <div className="grid grid-cols-6 gap-3">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
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
                  <div className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-3 py-1 rounded-full text-xs">
                    🔴 SOLD OUT
                  </div>
                )}
                {product.status === 'RESERVED' && (
                  <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-full text-xs">
                    🟡 RESERVED
                  </div>
                )}
                {product.isSwapEnabled && (
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <RefreshCw size={12} /> SWAP AVAILABLE
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{product.title}</h1>
              
              <div className="text-4xl font-black text-white">
                ₹{product.price?.toLocaleString('en-IN')}
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-zxaaa-primary-bg)] text-[var(--color-zxaaa-text)] border border-[var(--color-zxaaa-primary-glow)] flex items-center gap-1.5">
                  <Tag size={14} /> {product.category}
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-zxaaa-bg)] text-white border border-[var(--color-zxaaa-border)]">
                  {product.condition} condition
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-muted)] border border-[var(--color-zxaaa-border)] flex items-center gap-1.5">
                  <MapPin size={14} /> {product.city || 'Vadodara'}
                </span>
              </div>

              {/* Seller Box */}
              <div className="p-4 rounded-[16px] flex items-center gap-4" style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary), #2563eb)' }}>
                  {product.seller?.name?.charAt(0) ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--color-zxaaa-muted)] font-bold uppercase tracking-wider mb-0.5">Listed By</div>
                  <div className="font-bold text-white text-base truncate">{product.seller?.name ?? 'Verified Seller'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-[var(--color-zxaaa-muted)] font-bold uppercase tracking-wider mb-0.5">Trust Score</div>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1 justify-end">
                    <ShieldCheck size={14} /> {product.seller?.trustScore ?? '95'}/100
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-[var(--color-zxaaa-muted)] text-sm leading-relaxed whitespace-pre-line">
                  {product.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            {product.status === 'ACTIVE' && !isOwner && (
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full btn-primary py-4 text-base flex justify-center items-center gap-2"
                >
                  {buying ? 'Processing...' : <><Zap size={18} /> Buy Now with Pay at Pickup</>}
                </button>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      const sellerId = product.seller?._id || product.seller;
                      const sellerName = product.seller?.name || 'Seller';
                      navigate(`/messages?seller=${sellerId}&sellerName=${encodeURIComponent(sellerName)}&product=${product._id}&title=${encodeURIComponent(product.title)}`);
                    }}
                    className="flex-1 btn-secondary py-3 flex justify-center items-center gap-2"
                  >
                    <MessageSquare size={16} /> Chat
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
              <div className="mt-8 p-4 rounded-xl text-center bg-white/5 border border-white/10">
                <p className="text-sm text-[var(--color-zxaaa-muted)] font-bold">This is your listing.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction & QR System Panel */}
      {order && product.status !== 'SOLD' && (
        <div className="p-8 rounded-[24px] border border-[var(--color-zxaaa-primary)] space-y-6 relative overflow-hidden" style={{ background: 'var(--color-zxaaa-card)' }}>
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, var(--color-zxaaa-primary), #3b82f6)' }} />
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3"
              style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)', color: 'var(--color-zxaaa-text)' }}>
              <ShieldCheck size={12} /> Secure Transaction
            </div>
            <h2 className="text-3xl font-black text-white">Order Reserved!</h2>
            <p className="text-sm text-[var(--color-zxaaa-muted)] mt-2 max-w-xl">
              You have reserved this product. Please show this secure QR code to the seller during your in-person meetup to verify and complete the transaction.
            </p>
          </div>

          <div className="flex justify-center my-8">
            <RealQRCode 
              value={order.qrReference}
              title="Buyer Pick-Up QR Code"
              subtitle={`Order ID: ${order.orderId}`}
            />
          </div>

          <div className="pt-6 border-t border-[var(--color-zxaaa-border)] flex flex-col items-center gap-3">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Simulate Seller Scanning QR (Dev Tool)</p>
            <button
              onClick={handleVerifyQR}
              disabled={verifyLoading}
              className="btn-primary px-8 py-3 text-sm flex items-center gap-2"
            >
              {verifyLoading ? 'Verifying...' : <><Zap size={16} /> Simulate Scan & Pay at Pickup</>}
            </button>
          </div>
        </div>
      )}

      {product.status === 'SOLD' && order && (
        <div className="p-8 rounded-[24px] border border-emerald-500/50 bg-emerald-500/10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-emerald-400 mb-2">Transaction Completed!</h2>
          <p className="text-base text-white mb-6">Your digital receipt has been generated.</p>
          <div className="inline-block text-left bg-black/40 p-6 rounded-2xl border border-white/10 space-y-2">
            <p className="text-sm text-[var(--color-zxaaa-muted)]"><span className="font-bold text-white w-24 inline-block">Order ID:</span> {order.orderId}</p>
            <p className="text-sm text-[var(--color-zxaaa-muted)]"><span className="font-bold text-white w-24 inline-block">Payment:</span> {order.paymentMethod}</p>
            <p className="text-sm text-[var(--color-zxaaa-muted)]"><span className="font-bold text-white w-24 inline-block">Status:</span> <span className="text-emerald-400 font-bold">VERIFIED</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
