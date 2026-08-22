import { Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Wallet</h1>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.1))', border: '1px solid rgba(124,58,237,0.3)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-zxaaa-purple)' }}>
            <WalletIcon size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-3xl font-black text-white">₹{(user?.walletPoints || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <p className="text-xs text-[var(--color-zxaaa-muted)]">Use your balance to buy items or withdraw to your bank account.</p>
      </div>
    </div>
  );
}
