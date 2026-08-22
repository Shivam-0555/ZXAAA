import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    
    const res = await register({
      ...formData,
      latitude: 22.3072,
      longitude: 73.1812
    });
    
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl px-5 py-3 focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] text-white text-sm transition-colors font-bold placeholder:font-normal placeholder:text-[var(--color-zxaaa-muted)]";

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-[28px] overflow-hidden shadow-2xl"
        style={{ border: '1px solid var(--color-zxaaa-border)', background: 'var(--color-zxaaa-card)' }}>
        
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: 'var(--color-zxaaa-bg)', borderRight: '1px solid var(--color-zxaaa-border)' }}>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-zxaaa-primary-glow) 0%, transparent 60%)', opacity: 0.3 }} />
          
          <div className="relative">
            <Logo size="lg" interactive={false} showText className="mb-8" />
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Join thousands of<br />local traders.
            </h2>
            <p className="text-[var(--color-zxaaa-muted)] text-sm leading-relaxed">
              Create your free account and start buying, selling, and swapping in your neighbourhood.
            </p>
          </div>
          
          <div className="relative">
            <div className="p-5 rounded-2xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
              <p className="text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-widest mb-2">🏆 Trust System</p>
              <p className="text-sm text-white font-bold">Build your ZXAAA Trust Score. Respond within 2 hours and get verified badges.</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="md:hidden mb-4">
              <Logo size="md" interactive={false} showText={false} />
            </div>
            <h2 className="text-3xl font-black text-white mb-1">Create Account</h2>
            <p className="text-[var(--color-zxaaa-muted)] text-sm">Join the ZXAAA community</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-5 text-sm font-bold">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" name="name" required value={formData.name}
                onChange={handleChange} placeholder="Shivam Singh" className={inputClass} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" name="email" required value={formData.email}
                  onChange={handleChange} placeholder="you@email.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-1.5">Phone</label>
                <input type="tel" name="phone" required value={formData.phone}
                  onChange={handleChange} placeholder="9876543210" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-1.5">City</label>
              <input type="text" name="city" required value={formData.city}
                onChange={handleChange} placeholder="e.g. Vadodara" className={inputClass} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} name="password" required
                    value={formData.password} onChange={handleChange} placeholder="Min 8 chars"
                    className={inputClass + ' pr-12'} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)] hover:text-white transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input type="password" name="confirmPassword" required
                  value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                  className={inputClass} />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3.5 flex justify-center items-center gap-2 mt-2"
            >
              {loading ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-[var(--color-zxaaa-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-[var(--color-zxaaa-text)] hover:text-white transition-colors">
              Sign in &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
