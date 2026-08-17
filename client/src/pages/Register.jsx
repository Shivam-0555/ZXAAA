import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
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
    
    // Default coordinates for Vadodara, Gujarat (Demo City as per instructions)
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

  return (
    <div className="flex justify-center items-center h-full min-h-[80vh] py-8">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-lg">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" interactive={false} showText={false} className="mb-2" />
          <h2 className="text-3xl font-bold gradient-text mb-1">Create Account</h2>
          <p className="text-[var(--color-zxaaa-muted)] text-sm">Join the ZXAAA Marketplace community</p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="e.g. Vadodara" className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-zxaaa-purple)] text-white" />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : <><UserPlus size={20} /> Sign Up</>}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-[var(--color-zxaaa-muted)]">
          Already have an account? <Link to="/login" className="text-[var(--color-zxaaa-neon)] hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
