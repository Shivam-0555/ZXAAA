import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, ShieldCheck, Zap, Mail, Smartphone } from 'lucide-react';
import Logo from '../components/Logo';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'mobile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // DEV ONLY: show OTP on screen
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin, requestOtp, verifyOtpLogin } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
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

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!otpSent) {
      // phone state already contains only digits (enforced by onChange)
      if (phone.length !== 10) {
        setError('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }
      const res = await requestOtp(phone);
      if (res.success) {
        setOtpSent(true);
        if (res.devOtp) setDevOtp(res.devOtp); // DEV ONLY
      } else {
        setError(res.message);
      }

    } else {
      const res = await verifyOtpLogin(phone, otp);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };


  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const res = await googleLogin(tokenResponse.access_token);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
      setLoading(false);
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });

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
            <h2 className="text-3xl font-black text-[var(--color-zxaaa-text)] leading-tight mb-3">
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
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="md:hidden mb-4">
              <Logo size="md" interactive={false} showText={false} />
            </div>
            <h2 className="text-3xl font-black text-[var(--color-zxaaa-text)] mb-1">Welcome back</h2>
            <p className="text-[var(--color-zxaaa-muted)] text-sm">Sign in to your ZXAAA account</p>
          </div>
          
          {/* DEV ONLY: Show OTP hint */}
          {devOtp && (
            <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 p-3.5 rounded-xl mb-4 text-sm font-bold flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest opacity-70">🔧 Dev Mode — OTP (remove in production)</span>
              <span className="text-2xl tracking-[0.3em] font-black text-amber-400">{devOtp}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => { setLoginMode('email'); setOtpSent(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl flex justify-center items-center gap-2 transition-colors border ${loginMode === 'email' ? 'bg-[var(--color-zxaaa-primary)] text-[var(--color-zxaaa-text)] border-[var(--color-zxaaa-primary)]' : 'bg-transparent text-[var(--color-zxaaa-muted)] border-[var(--color-zxaaa-border)] hover:bg-white/5'}`}>
              <Mail size={16} /> Email
            </button>
            <button 
              onClick={() => { setLoginMode('mobile'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl flex justify-center items-center gap-2 transition-colors border ${loginMode === 'mobile' ? 'bg-[var(--color-zxaaa-primary)] text-[var(--color-zxaaa-text)] border-[var(--color-zxaaa-primary)]' : 'bg-transparent text-[var(--color-zxaaa-muted)] border-[var(--color-zxaaa-border)] hover:bg-white/5'}`}>
              <Smartphone size={16} /> Mobile
            </button>
          </div>
          
          {loginMode === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] text-sm transition-colors font-bold"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[var(--color-zxaaa-primary)] hover:text-[var(--color-zxaaa-text)] transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 pr-12 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] text-sm transition-colors font-bold"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] hover:text-[var(--color-zxaaa-text)] transition-colors">
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
          ) : (
            <form onSubmit={handleMobileSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Mobile Number</label>
                <div className={`flex items-center w-full bg-[var(--color-zxaaa-bg)] border rounded-xl overflow-hidden transition-colors ${otpSent ? 'opacity-50' : 'border-[var(--color-zxaaa-border)] focus-within:border-[var(--color-zxaaa-primary-glow)]'}`}
                  style={{ borderColor: 'var(--color-zxaaa-border)' }}>
                  {/* +91 prefix */}
                  <span className="px-4 py-3.5 text-sm font-black text-[var(--color-zxaaa-text)] border-r shrink-0 select-none"
                    style={{ borderColor: 'var(--color-zxaaa-border)', background: 'rgba(255,255,255,0.04)' }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={phone}
                    onChange={(e) => {
                      // Only allow digits, max 10
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    className="flex-1 bg-transparent px-4 py-3.5 focus:outline-none text-[var(--color-zxaaa-text)] text-sm font-bold tracking-widest disabled:cursor-not-allowed"
                    placeholder="0000000000"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d{10}"
                  />
                  {phone.length > 0 && (
                    <span className={`px-3 text-xs font-black ${phone.length === 10 ? 'text-emerald-400' : 'text-[var(--color-zxaaa-muted)]'}`}>
                      {phone.length}/10
                    </span>
                  )}
                </div>
              </div>


              {otpSent && (
                <div>
                  <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Enter OTP</label>
                  <input 
                    type="text" 
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] text-sm transition-colors font-bold tracking-widest text-center"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 text-base flex justify-center items-center gap-2 mt-2"
              >
                {loading ? 'Processing...' : (!otpSent ? 'Request OTP' : 'Verify & Login')}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-[var(--color-zxaaa-border)] flex-1" />
            <span className="text-xs font-bold text-[var(--color-zxaaa-muted)]">OR</span>
            <div className="h-px bg-[var(--color-zxaaa-border)] flex-1" />
          </div>

          <button 
            onClick={() => googleLoginHandler()}
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-card2)] hover:bg-white/5 transition-colors text-sm font-bold text-[var(--color-zxaaa-text)]"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          <div className="mt-8 text-center text-sm text-[var(--color-zxaaa-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-black text-[var(--color-zxaaa-text)] hover:text-[var(--color-zxaaa-text)] transition-colors">
              Create one &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
