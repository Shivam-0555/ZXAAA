import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, MapPin, Tag, ShieldCheck } from 'lucide-react';
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

  if (loading) return <div className="p-8 text-[var(--color-zxaaa-muted)]">Loading product...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!product) return null;

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'];

  const currentMainImage = imagesList[selectedImage] || imagesList[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-8">
        
        {/* Interactive 6-Image Viewer Gallery */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* Main Large Display Image */}
          <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-[var(--color-zxaaa-border)] bg-black/40">
            <img
              src={currentMainImage}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop';
              }}
            />
            <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-black/70 text-purple-300 backdrop-blur-md border border-white/10">
              Photo {selectedImage + 1} of {imagesList.length}
            </span>
          </div>

          {/* 6 Thumbnail Selector Grid */}
          {imagesList.length > 0 && (
            <div className="grid grid-cols-6 gap-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-14 rounded-xl overflow-hidden border transition-all duration-200 ${
                    selectedImage === idx
                      ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105'
                      : 'border-[var(--color-zxaaa-border)] opacity-60 hover:opacity-100 hover:border-purple-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info */}
        <div className="w-full md:w-1/2 space-y-4 flex flex-col justify-between">
          <div>
            {product.status === 'SOLD' && (
              <div className="bg-red-500/20 text-red-500 font-bold px-3 py-1 rounded-full text-xs inline-block mb-2">
                🔴 SOLD
              </div>
            )}
            {product.status === 'RESERVED' && (
              <div className="bg-yellow-500/20 text-yellow-500 font-bold px-3 py-1 rounded-full text-xs inline-block mb-2">
                🟡 RESERVED
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{product.title}</h1>
            
            {/* Seller Info */}
            <div className="flex items-center gap-3 my-4 p-3 rounded-xl bg-white/[0.03] border border-[var(--color-zxaaa-border)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {product.seller?.name?.charAt(0) ?? 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-white text-sm truncate">{product.seller?.name ?? 'Verified Seller'}</div>
                <div className="text-xs text-[var(--color-zxaaa-muted)] flex items-center gap-1">
                  <ShieldCheck size={13} className="text-purple-400" /> Trust Score: {product.seller?.trustScore ?? '95'}/100
                </div>
              </div>
            </div>

            <div className="text-3xl font-black text-emerald-400 mb-4">₹{product.price?.toLocaleString('en-IN')}</div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-300">
              <span className="bg-purple-950/40 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                <Tag size={12} /> {product.category}
              </span>
              <span className="bg-blue-950/40 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
                {product.condition} condition
              </span>
              <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-full flex items-center gap-1">
                <MapPin size={12} /> {product.city || 'Vadodara'}
              </span>
            </div>

            <p className="text-zinc-300 text-sm mt-4 leading-relaxed">{product.description}</p>
          </div>

          {product.status === 'ACTIVE' && user?._id !== product.seller?._id && (
            <div className="flex gap-3 pt-4 border-t border-[var(--color-zxaaa-border)]">
              <button 
                onClick={() => navigate('/messages')}
                className="flex-1 border border-purple-500 text-purple-400 font-bold py-3 rounded-xl hover:bg-purple-600 hover:text-white transition-all text-sm"
              >
                💬 Chat Seller
              </button>
              <button
                onClick={handleBuy}
                disabled={buying}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-purple-600/30"
              >
                {buying ? 'Processing...' : '⚡ Buy Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction & QR System Panel */}
      {order && product.status !== 'SOLD' && (
        <div className="glass-panel p-8 rounded-2xl border border-purple-500/40 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">ZXAAA Secure Transaction</h2>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mt-1">
              You have reserved this product. Show this real scannable QR code to the seller during in-person pickup.
            </p>
          </div>

          <RealQRCode 
            value={order.qrReference}
            title="Buyer Pick-Up QR Code"
            subtitle={`Order ID: ${order.orderId}`}
          />

          <div className="pt-4 border-t border-[var(--color-zxaaa-border)] flex flex-col items-center gap-2">
            <p className="text-xs text-yellow-400">Simulate Seller Scanning QR (Dev Tool):</p>
            <button
              onClick={handleVerifyQR}
              disabled={verifyLoading}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              {verifyLoading ? 'Verifying...' : '⚡ Simulate Scan & Pay at Pickup'}
            </button>
          </div>
        </div>
      )}

      {product.status === 'SOLD' && order && (
        <div className="glass-panel p-8 rounded-2xl border border-green-500/50 bg-green-500/10">
          <h2 className="text-2xl font-bold text-green-400 mb-2">Transaction Completed!</h2>
          <p className="text-sm text-zinc-300">Digital Receipt: {order.orderId}</p>
          <p className="text-sm text-zinc-300">Payment: {order.paymentMethod}</p>
          <p className="text-sm text-zinc-300">Status: VERIFIED</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
