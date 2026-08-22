import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const features = [
    { icon: '🛒', text: 'Buy & sell locally' },
    { icon: '🔄', text: 'Swap with price diff' },
    { icon: '🛡️', text: 'ZXAAA Trust Score' },
    { icon: '📱', text: 'QR-verified deals' },
  ];

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-[28px] overflow-hidden shadow-2xl"
        style={{ border: '1px solid var(--color-zxaaa-border)', background: 'var(--color-zxaaa-card)' }}>
        
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: 'var(--color-zxaaa-bg)', borderRight: '1px solid var(--color-zxaaa-border)' }}>
          {/* Ambient glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-zxaaa-primary-glow) 0%, transparent 60%)', opacity: 0.4 }} />
          
          <div className="relative">
            <Logo size="lg" interactive={false} showText className="mb-8" />
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Your local<br />marketplace.
            </h2>
            <p className="text-[var(--color-zxaaa-muted)] text-sm leading-relaxed">
              Buy, sell and swap pre-loved items with verified sellers near you.
            </p>
          </div>
          
          <div className="relative space-y-3">
            {features.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)' }}>
                  {f.icon}
                </div>
                <span className="text-sm font-bold text-[var(--color-zxaaa-muted)]">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="md:hidden mb-4">
              <Logo size="md" interactive={false} showText={false} />
            </div>
            <h2 className="text-3xl font-black text-white mb-1">Welcome back</h2>
            <p className="text-[var(--color-zxaaa-muted)] text-sm">Sign in to your ZXAAA account</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-sm font-bold">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm transition-colors font-bold"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 pr-12 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm transition-colors font-bold"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 text-base flex justify-center items-center gap-2 mt-2"
            >
              {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-[var(--color-zxaaa-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-black text-[var(--color-zxaaa-text)] hover:text-white transition-colors">
              Create one &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
