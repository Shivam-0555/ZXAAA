import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [devOtp, setDevOtp] = useState(''); // DEV ONLY
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api/auth';

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Clean mobile number if entered (strip +91, spaces)
      let cleanId = identifier.trim();
      if (/^\+?91[\s\-]?\d/.test(cleanId)) {
        cleanId = cleanId.replace(/^(\+91|91)/, '').replace(/[\s\-]/g, '');
      }
      const { data } = await axios.post(`${API_URL}/request-otp`, { identifier: cleanId });
      if (data.success) {
        setIdentifier(cleanId);
        setStep(2);
        setSuccess(data.message);
        if (data.devOtp) setDevOtp(data.devOtp); // DEV ONLY
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    }
    setLoading(false);
  };


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/verify-reset-otp`, { identifier, otp });
      if (data.success) {
        setStep(3);
        setSuccess('OTP verified. Set your new password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/reset-password`, { identifier, otp, newPassword });
      if (data.success) {
        setSuccess('Password reset successfully! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl p-8"
        style={{ border: '1px solid var(--color-zxaaa-border)', background: 'var(--color-zxaaa-card)' }}>
        
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="md" interactive={false} showText={false} className="mb-4" />
          <h2 className="text-2xl font-black text-[var(--color-zxaaa-text)] mb-1">Reset Password</h2>
          <p className="text-[var(--color-zxaaa-muted)] text-sm">Follow the steps to regain access</p>
        </div>
        
        {devOtp && (
          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 p-3.5 rounded-xl mb-4 text-sm font-bold flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest opacity-70">🔧 Dev Mode — Your OTP</span>
            <span className="text-2xl tracking-[0.3em] font-black text-amber-400">{devOtp}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-sm font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3.5 rounded-xl mb-6 text-sm font-bold flex gap-2 items-center">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Email or Mobile Number</label>
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] text-sm transition-colors font-bold"
                placeholder="you@email.com or 9876543210"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm flex justify-center items-center gap-2 mt-2"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">Enter OTP</label>
              <input 
                type="text" 
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] text-sm transition-colors font-bold tracking-widest text-center"
                placeholder="------"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm flex justify-center items-center gap-2 mt-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-2">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-[var(--color-zxaaa-text)] text-sm transition-colors font-bold"
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm flex justify-center items-center gap-2 mt-2"
            >
              {loading ? 'Resetting...' : <><KeyRound size={16} /> Reset Password</>}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-[var(--color-zxaaa-muted)]">
          Remembered your password?{' '}
          <Link to="/login" className="font-black text-[var(--color-zxaaa-text)] hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;