import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      // Refresh product state
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {/* Image Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.title} image ${idx + 1}`}
                  className="object-cover w-full h-48 rounded-lg border border-[var(--color-zxaaa-border)]"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {product.status === 'SOLD' && (
            <div className="bg-red-500/20 text-red-500 font-bold px-3 py-1 rounded-md inline-block">
              🔴 SOLD
            </div>
          )}
          {product.status === 'RESERVED' && (
            <div className="bg-yellow-500/20 text-yellow-500 font-bold px-3 py-1 rounded-md inline-block">
              🟡 RESERVED
            </div>
          )}

          <h1 className="text-3xl font-bold">{product.title}</h1>
          
          {/* Seller Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-zxaaa-purple)] flex items-center justify-center text-sm font-bold text-white">
              {product.seller?.name?.charAt(0) ?? 'U'}
            </div>
            <div>
              <div className="font-medium">{product.seller?.name ?? 'Unknown Seller'}</div>
              <div className="text-xs text-[var(--color-zxaaa-muted)]">Trust Score: {product.seller?.trustScore ?? 'N/A'}/100</div>
            </div>
          </div>
          <div className="text-2xl font-bold gradient-text">₹{product.price}</div>

          <div className="flex gap-4 text-sm text-[var(--color-zxaaa-muted)]">
            <span className="bg-[var(--color-zxaaa-card)] px-3 py-1 rounded-full">{product.category}</span>
            <span className="bg-[var(--color-zxaaa-card)] px-3 py-1 rounded-full">{product.condition} condition</span>
          </div>

          <p className="text-[var(--color-zxaaa-muted)] mt-4">{product.description}</p>

          {product.status === 'ACTIVE' && user?._id !== product.seller._id && (
            <div className="flex gap-4 pt-4">
              <button className="flex-1 border border-[var(--color-zxaaa-purple)] text-[var(--color-zxaaa-purple)] font-bold py-3 rounded-lg hover:bg-[var(--color-zxaaa-purple)] hover:text-white transition-colors">
                Chat
              </button>
              <button
                onClick={handleBuy}
                disabled={buying}
                className="flex-1 bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] text-white font-bold py-3 rounded-lg hover:opacity-90"
              >
                {buying ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction & QR System Panel */}
      {order && product.status !== 'SOLD' && (
        <div className="glass-panel p-8 rounded-2xl border border-[var(--color-zxaaa-blue)]">
          <h2 className="text-2xl font-bold mb-4">ZXAAA Secure Transaction</h2>
          <p className="text-[var(--color-zxaaa-muted)] mb-6">
            You have reserved this product. Meet the seller and inspect the item physically.
          </p>

          <div className="bg-[var(--color-zxaaa-bg)] p-6 rounded-xl border border-[var(--color-zxaaa-border)] flex flex-col items-center justify-center space-y-4">
            <div className="text-lg font-bold">Show this QR to the seller:</div>
            <div className="w-48 h-48 bg-white flex items-center justify-center p-4 rounded-xl shadow-lg">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <span className="text-sm text-gray-500">Generating QR...</span>
              )}
            </div>
            
            {order.qrReference && (
              <div className="text-center">
                <div className="text-xs text-[var(--color-zxaaa-muted)] mb-1">Manual Reference Code (Fallback):</div>
                <code className="bg-[var(--color-zxaaa-card)] px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-sm border border-[var(--color-zxaaa-border)] tracking-wider">
                  {order.qrReference}
                </code>
              </div>
            )}

            <div className="w-full pt-4 border-t border-[var(--color-zxaaa-border)] flex flex-col items-center gap-2">
              <p className="text-sm text-yellow-500 mb-2">Simulate Seller Scanning QR (Dev Tool):</p>
              <button
                onClick={handleVerifyQR}
                disabled={verifyLoading}
                className="bg-[var(--color-zxaaa-purple)] text-white px-6 py-2 rounded-lg font-bold"
              >
                {verifyLoading ? 'Verifying...' : 'Simulate Scan & Pay at Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {product.status === 'SOLD' && order && (
        <div className="glass-panel p-8 rounded-2xl border border-green-500/50 bg-green-500/10">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Transaction Completed!</h2>
          <p>Digital Receipt: {order.orderId}</p>
          <p>Payment: {order.paymentMethod}</p>
          <p>Status: VERIFIED</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
