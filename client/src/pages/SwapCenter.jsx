import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SwapCenter = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchSwaps = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/swaps', config);
        setSwaps(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch swaps');
      } finally {
        setLoading(false);
      }
    };
    fetchSwaps();
  }, [user]);

  if (!user) {
    return <div className="p-8 text-center text-[var(--color-zxaaa-muted)]">Please log in to view the Swap Center.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] p-8 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Swap Center</h1>
          <p className="text-white/80">Got something you don't need? Find someone who needs it!</p>
        </div>
        <div className="hidden md:flex gap-4 opacity-50">
          <div className="w-16 h-24 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 rounded-full bg-white/20 self-center"></div>
          <div className="w-16 h-24 bg-white/20 rounded-lg"></div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Swap Proposals</h2>
        
        {loading ? (
          <div className="text-[var(--color-zxaaa-muted)]">Loading swaps...</div>
        ) : error ? (
          <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>
        ) : swaps.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center text-[var(--color-zxaaa-muted)]">
            You don't have any active swap proposals. 
            Go to a product page and click "Propose Swap" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {swaps.map(swap => (
              <div key={swap._id} className="glass-panel p-6 rounded-xl border border-[var(--color-zxaaa-border)] flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Proposer Product */}
                <div className="flex-1 text-center">
                  <div className="text-sm text-[var(--color-zxaaa-muted)] mb-2">
                    {swap.proposer._id === user._id ? 'Your Item' : swap.proposer.name + "'s Item"}
                  </div>
                  <div className="font-bold">{swap.proposerProduct.title}</div>
                  <div className="text-[var(--color-zxaaa-purple)]">₹{swap.proposerProduct.price}</div>
                </div>

                {/* Swap Icon / Status */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-zxaaa-card)] flex items-center justify-center mb-2">
                    🔄
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    swap.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                    swap.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {swap.status}
                  </span>
                  
                  {swap.priceDifference > 0 && (
                     <div className="text-xs text-[var(--color-zxaaa-muted)] mt-2 text-center">
                       {swap.priceDifferencePaidBy} pays ₹{swap.priceDifference}
                     </div>
                  )}
                </div>

                {/* Receiver Product */}
                <div className="flex-1 text-center">
                  <div className="text-sm text-[var(--color-zxaaa-muted)] mb-2">
                    {swap.receiver._id === user._id ? 'Your Item' : swap.receiver.name + "'s Item"}
                  </div>
                  <div className="font-bold">{swap.receiverProduct.title}</div>
                  <div className="text-[var(--color-zxaaa-purple)]">₹{swap.receiverProduct.price}</div>
                </div>
                
                {/* Actions */}
                {swap.status === 'PENDING' && swap.receiver._id === user._id && (
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <button className="bg-green-500/20 text-green-500 hover:bg-green-500/30 font-bold py-2 rounded-lg text-sm">Accept</button>
                    <button className="bg-red-500/20 text-red-500 hover:bg-red-500/30 font-bold py-2 rounded-lg text-sm">Reject</button>
                  </div>
                )}
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapCenter;
