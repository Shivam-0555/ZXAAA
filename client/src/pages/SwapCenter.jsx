import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, ArrowRightLeft, MessageSquare, ShieldCheck, Check, X, Handshake, Loader2, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';

import { Link } from 'react-router-dom';

const SwapCenter = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, ACCEPTED, COMPLETED

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

  const handleUpdateStatus = async (swapId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/swaps/${swapId}`, { status: newStatus }, config);
      setSwaps(swaps.map(s => s._id === swapId ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update swap status');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
        <p className="text-[var(--color-zxaaa-muted)] mb-6 text-center max-w-md">
          Please log in to your account to view your Swap Center and manage trade proposals.
        </p>
        <Link to="/login" className="btn-primary px-8 py-3">Login to Continue</Link>
      </div>
    );
  }

  const filteredSwaps = activeTab === 'ALL' ? swaps : swaps.filter(s => s.status === activeTab);

  const pendingCount = swaps.filter(s => s.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] p-8 md:p-12 shadow-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        <div className="absolute top-0 left-0 w-full h-2" style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
              <RefreshCw size={12} /> Zero Cash Exchange
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Swap Center</h1>
            <p className="text-base text-[var(--color-zxaaa-muted)] max-w-lg">
              Manage your direct product exchanges. Trade what you don't need for what you want, securely and locally.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-6 opacity-80 pointer-events-none">
             <div className="w-24 h-32 rounded-xl bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] flex items-center justify-center relative shadow-lg">
               <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent" />
               <ImageIcon size={32} className="text-[var(--color-zxaaa-muted)]" />
             </div>
             <div className="w-12 h-12 rounded-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] flex items-center justify-center text-emerald-400">
               <ArrowRightLeft size={20} />
             </div>
             <div className="w-24 h-32 rounded-xl bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] flex items-center justify-center relative shadow-lg">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent" />
               <ImageIcon size={32} className="text-[var(--color-zxaaa-muted)]" />
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'ALL', label: 'All Swaps', icon: null },
          { id: 'PENDING', label: 'Pending', icon: <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">{pendingCount}</span> },
          { id: 'ACCEPTED', label: 'Accepted', icon: null },
          { id: 'COMPLETED', label: 'Completed', icon: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              activeTab === tab.id
                ? 'bg-[var(--color-zxaaa-primary-bg)] border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]'
                : 'bg-[var(--color-zxaaa-card)] border-[var(--color-zxaaa-border)] text-[var(--color-zxaaa-muted)] hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-[var(--color-zxaaa-primary)] animate-spin" />
            <p className="text-sm font-bold text-[var(--color-zxaaa-muted)]">Loading your swap proposals...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-bold text-center">
            {error}
          </div>
        ) : filteredSwaps.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-[var(--color-zxaaa-border)] flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] flex items-center justify-center mb-4">
              <RefreshCw size={32} className="text-[var(--color-zxaaa-muted)]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} swaps found.</h3>
            <p className="text-[var(--color-zxaaa-muted)] max-w-sm mb-8 text-sm">
              You don't have any trade proposals here. List a product with "Accept Swaps" enabled or propose a trade on another item.
            </p>
            <div className="flex gap-4">
              <Link to="/explore?swap=true" className="btn-primary px-6 py-2.5 text-sm">Find Items to Swap</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredSwaps.map(swap => {
              const amIProposer = swap.proposer._id === user._id;
              const myProduct = amIProposer ? swap.proposerProduct : swap.receiverProduct;
              const theirProduct = amIProposer ? swap.receiverProduct : swap.proposerProduct;
              const theirProfile = amIProposer ? swap.receiver : swap.proposer;
              
              const amIPayingDiff = swap.priceDifference > 0 && swap.priceDifferencePaidBy === (amIProposer ? 'PROPOSER' : 'RECEIVER');
              const amIReceivingDiff = swap.priceDifference > 0 && swap.priceDifferencePaidBy === (amIProposer ? 'RECEIVER' : 'PROPOSER');

              return (
                <div key={swap._id} className="relative rounded-[20px] overflow-hidden shadow-lg" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
                  
                  {/* Status Banner */}
                  <div className={`px-5 py-2 text-xs font-black uppercase tracking-wider border-b ${
                    swap.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    swap.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    swap.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    Status: {swap.status}
                    {swap.status === 'PENDING' && !amIProposer && ' • Action Required'}
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                      
                      {/* MY ITEM */}
                      <div className="flex-1 w-full relative">
                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded text-[10px] font-bold text-[var(--color-zxaaa-muted)]">MY ITEM</div>
                        <div className="p-4 rounded-xl border-2 border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)] flex gap-4">
                           <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[var(--color-zxaaa-border)] bg-black">
                             <img src={myProduct?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop'} alt={myProduct?.title} className="w-full h-full object-cover" />
                           </div>
                           <div className="min-w-0 flex-1">
                             <h4 className="text-white font-bold truncate">{myProduct?.title || 'Unknown Product'}</h4>
                             <p className="text-sm font-black mt-1 text-[var(--color-zxaaa-primary)]">₹{myProduct?.price || 0}</p>
                           </div>
                        </div>
                      </div>

                      {/* SWAP BRIDGE */}
                      <div className="shrink-0 flex flex-col items-center w-full lg:w-48 relative">
                         {/* Connecting Lines for Desktop */}
                         <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--color-zxaaa-border)] via-[var(--color-zxaaa-primary)] to-[var(--color-zxaaa-border)] -z-10" />
                         
                         <div className="w-12 h-12 rounded-full bg-[var(--color-zxaaa-primary-bg)] border-2 border-[var(--color-zxaaa-primary)] flex items-center justify-center text-[var(--color-zxaaa-primary)] shadow-[0_0_15px_var(--color-zxaaa-primary-glow)] z-10">
                           <RefreshCw size={20} />
                         </div>

                         {swap.priceDifference > 0 && (
                           <div className="mt-4 p-2.5 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/10 text-center w-full">
                             <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-zxaaa-muted)] mb-1">Difference</p>
                             <p className="text-xs font-bold text-emerald-400">
                               {amIPayingDiff ? 'I Pay: ' : 'I Receive: '}
                               <span className="text-sm font-black">₹{swap.priceDifference}</span>
                             </p>
                           </div>
                         )}
                      </div>

                      {/* THEIR ITEM */}
                      <div className="flex-1 w-full relative">
                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded text-[10px] font-bold text-[var(--color-zxaaa-muted)]">THEIR ITEM</div>
                        <div className="p-4 rounded-xl border-2 border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)] flex gap-4">
                           <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[var(--color-zxaaa-border)] bg-black">
                             <img src={theirProduct?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop'} alt={theirProduct?.title} className="w-full h-full object-cover" />
                           </div>
                           <div className="min-w-0 flex-1">
                             <h4 className="text-white font-bold truncate">{theirProduct?.title || 'Unknown Product'}</h4>
                             <p className="text-sm font-black mt-1 text-[var(--color-zxaaa-primary)]">₹{theirProduct?.price || 0}</p>
                             
                             {/* User Info Micro */}
                             <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--color-zxaaa-border)]">
                               <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                                 {theirProfile?.name?.charAt(0) || 'U'}
                               </div>
                               <span className="text-[10px] font-bold text-[var(--color-zxaaa-muted)] truncate">{theirProfile?.name || 'User'}</span>
                             </div>
                           </div>
                        </div>
                      </div>

                    </div>

                    {/* Actions Panel */}
                    <div className="mt-6 pt-6 border-t border-[var(--color-zxaaa-border)] flex flex-wrap items-center justify-end gap-3">
                      
                      {swap.status !== 'REJECTED' && (
                        <button className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-primary-glow)] bg-[var(--color-zxaaa-primary-bg)] hover:bg-[var(--color-zxaaa-primary)] hover:text-white transition-colors flex items-center gap-2">
                          <MessageSquare size={14} /> Chat
                        </button>
                      )}

                      {swap.status === 'PENDING' && !amIProposer && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(swap._id, 'REJECTED')}
                            className="px-5 py-2 rounded-xl text-sm font-bold text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                          >
                            <X size={14} /> Decline
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(swap._id, 'ACCEPTED')}
                            className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                          >
                            <Check size={16} /> Accept Swap
                          </button>
                        </>
                      )}

                      {swap.status === 'PENDING' && amIProposer && (
                        <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg">
                          Waiting for {theirProfile?.name?.split(' ')[0] || 'User'} to review...
                        </div>
                      )}

                      {swap.status === 'ACCEPTED' && (
                        <div className="flex-1 flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                          <p className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                            <Handshake size={16} /> Swap Accepted! Chat with {theirProfile?.name?.split(' ')[0]} to arrange the meetup.
                          </p>
                          <button 
                            onClick={() => handleUpdateStatus(swap._id, 'COMPLETED')}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                          >
                            Mark Completed
                          </button>
                        </div>
                      )}
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapCenter;
