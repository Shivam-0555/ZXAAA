import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider, useLocationContext } from './context/LocationContext';
import LocationModal from './components/LocationModal';
import ProtectedRoute from './components/ProtectedRoute';
import Logo from './components/Logo';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Sell from './pages/Sell';
import ProductDetail from './pages/ProductDetail';
import SwapCenter from './pages/SwapCenter';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import ScanQR from './pages/ScanQR';
import Notifications from './pages/Notifications';
import {
  Home as HomeIcon, Search, Tag, RefreshCw, MessageSquare, QrCode,
  Shield, LogOut, ChevronDown, MapPin, Menu, X, User as UserIcon,
  Bell, Plus,
} from 'lucide-react';

// ── Nav Item ────────────────────────────────────────────────────────
function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
          isActive ? 'nav-active' : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.04]'
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(124,58,237,0.8)', color: 'white' }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ── Main Layout ─────────────────────────────────────────────────────
function MainLayout() {
  const { user, logout } = useAuth();
  const { selectedLocation, radiusKm } = useLocationContext();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const NAV_LINKS = [
    { to: '/',               icon: <HomeIcon size={18} />,      label: 'Home' },
    { to: '/explore',        icon: <Search size={18} />,        label: 'Explore' },
    { to: '/notifications',  icon: <Bell size={18} />,          label: 'Notifications', badge: '3' },
    { to: '/sell',           icon: <Tag size={18} />,           label: 'Sell Product' },
    { to: '/swap',           icon: <RefreshCw size={18} />,     label: 'Swap Center', badge: 'NEW' },
    { to: '/messages',       icon: <MessageSquare size={18} />, label: 'Messages' },
    { to: '/seller/scan-qr', icon: <QrCode size={18} />,       label: 'Scan QR' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-zxaaa-bg)' }}>

      {/* ── TOPBAR ── */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6 shrink-0"
        style={{ background: 'rgba(8,9,13,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(30,33,48,0.8)' }}>

        {/* Left: Logo + mobile menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(m => !m)}
            className="md:hidden p-2 rounded-lg text-[var(--color-zxaaa-muted)] hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Logo size="sm" />
        </div>

        {/* Center: Location pill */}
        <button
          onClick={() => setLocationModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:scale-[1.02]"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <MapPin size={13} className="text-purple-400" />
          <span className="hidden sm:inline max-w-[120px] truncate">{selectedLocation.name}</span>
          <span className="text-purple-400 text-[10px] font-bold">{radiusKm}km</span>
          <ChevronDown size={12} className="text-[var(--color-zxaaa-muted)]" />
        </button>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Link to="/notifications"
            className="p-2 rounded-xl text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05] transition-all relative"
            title="Notifications"
            style={{ border: '1px solid var(--color-zxaaa-border)' }}>
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center border border-black">
              3
            </span>
          </Link>

          <Link to="/sell"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
            <Plus size={14} /> List Item
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(d => !d)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all hover:bg-white/[0.05]"
                style={{ border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-white hidden sm:block max-w-[80px] truncate">{user.name}</span>
                <ChevronDown size={12} className="text-[var(--color-zxaaa-muted)] hidden sm:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 z-50 rounded-2xl overflow-hidden animate-fadeIn"
                    style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-zxaaa-border)' }}>
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-[var(--color-zxaaa-muted)]">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="p-1.5">
                      <Link to="/sell" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.04] rounded-xl">
                        <UserIcon size={14} /> My Listings
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.04] rounded-xl">
                          <Shield size={14} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl font-semibold">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-all hover:bg-white/[0.05]"
                style={{ border: '1px solid var(--color-zxaaa-border)' }}>
                Sign In
              </Link>
              <Link to="/register" className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col shrink-0`}
          style={{ width: 220, borderRight: '1px solid rgba(30,33,48,0.8)', background: 'rgba(8,9,13,0.95)', paddingTop: 8 }}>

          {/* Nav */}
          <nav className="px-3 space-y-0.5 flex-1">
            {NAV_LINKS.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
            {user?.role === 'admin' && (
              <NavItem to="/admin" icon={<Shield size={18} />} label="Admin Panel" />
            )}
          </nav>

          {/* Bottom user section */}
          <div className="px-3 pb-4 pt-4" style={{ borderTop: '1px solid rgba(30,33,48,0.8)' }}>
            {user ? (
              <div className="p-3 rounded-xl" style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-[var(--color-zxaaa-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold text-red-400 flex items-center justify-center gap-1.5 transition-colors hover:bg-red-500/10"
                  style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="block w-full py-2 text-center rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                Sign In
              </Link>
            )}
          </div>
        </aside>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 min-w-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/explore"        element={<Explore />} />
              <Route path="/notifications"  element={<Notifications />} />
              <Route path="/product/:id"    element={<ProductDetail />} />
              <Route path="/sell"           element={<ProtectedRoute><Sell /></ProtectedRoute>} />
              <Route path="/swap"           element={<SwapCenter />} />
              <Route path="/messages"       element={<Messages />} />
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/login"          element={<Login />} />
              <Route path="/register"       element={<Register />} />
              <Route path="/seller/scan-qr" element={<ProtectedRoute><ScanQR /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <MainLayout />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
