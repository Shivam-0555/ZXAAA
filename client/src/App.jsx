import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider, useLocationContext } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';
import LocationModal from './components/LocationModal';
import ProtectedRoute from './components/ProtectedRoute';

import Logo from './components/Logo';
import ThemeSwitcher from './components/ThemeSwitcher';
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

// New Pages & Components
import SavedItems from './pages/SavedItems';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import {
  Home as HomeIcon, Search, Tag, RefreshCw, MessageSquare, QrCode,
  Shield, LogOut, MapPin, ChevronDown, User as UserIcon,
  Bell, Plus, Heart, ListOrdered, Wallet as WalletIcon, Settings as SettingsIcon,
  Smartphone, Laptop, Bike, BookOpen, Shirt, Tv, Watch, Activity, MoreHorizontal, ShoppingBag
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Mobiles', icon: <Smartphone size={16} /> },
  { name: 'Laptops', icon: <Laptop size={16} /> },
  { name: 'Bikes', icon: <Bike size={16} /> },
  { name: 'Furniture', icon: <ShoppingBag size={16} /> },
  { name: 'Books & Study', icon: <BookOpen size={16} /> },
  { name: 'Clothes', icon: <Shirt size={16} /> },
  { name: 'Electronics', icon: <Tv size={16} /> },
  { name: 'Home Appliances', icon: <ShoppingBag size={16} /> },
  { name: 'Watches', icon: <Watch size={16} /> },
  { name: 'Sports', icon: <Activity size={16} /> },
  { name: 'Accessories', icon: <ShoppingBag size={16} /> },
  { name: 'More', icon: <MoreHorizontal size={16} /> }
];

function TopNavbar({ setLocationModalOpen }) {
  const { user, logout } = useAuth();
  const { selectedLocation } = useLocationContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQ)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[var(--color-zxaaa-border)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Location */}
        <div className="flex items-center gap-6">
          <Link to="/" className="shrink-0 flex items-center">
             <Logo size="md" />
          </Link>
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 transition-all">
              <MapPin size={16} className="text-[var(--color-zxaaa-primary)]" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Location</span>
                <span className="truncate max-w-[150px]">{selectedLocation.name.split(',')[0]} (5km)</span>
              </div>
              <ChevronDown size={14} className="ml-1 opacity-70" />
            </button>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search products, brands or categories..."
              className="w-full text-sm text-white pl-12 pr-4 py-2.5 rounded-full focus:outline-none transition-all bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] focus:border-[var(--color-zxaaa-primary)] focus:shadow-[0_0_0_1px_var(--color-zxaaa-primary-bg)]"
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeSwitcher />

          {user && (
            <>
              <Link to="/messages" title="Messages" className="hidden md:flex relative p-2 rounded-full text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 transition-all">
                <MessageSquare size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-zxaaa-primary)]"></span>
              </Link>
              <Link to="/notifications" title="Notifications" className="hidden md:flex relative p-2 rounded-full text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 transition-all">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              </Link>
              <Link to="/seller/scan-qr" title="Scan QR" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-primary-glow)] bg-[var(--color-zxaaa-primary-bg)] hover:bg-[var(--color-zxaaa-primary)] hover:text-white">
                <QrCode size={16} /> Scan QR
              </Link>
              <Link to="/saved-items" title="Saved" className="hidden md:flex p-2 rounded-full text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 transition-all">
                <Heart size={20} />
              </Link>
            </>
          )}

          {user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[var(--color-zxaaa-border)] hover:bg-white/5 transition-all">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white bg-[var(--color-zxaaa-primary)] shrink-0">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="text-sm font-semibold hidden md:block max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-[var(--color-zxaaa-muted)] hidden md:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 z-50 rounded-2xl bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] shadow-xl animate-fadeIn overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--color-zxaaa-border)]">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-[var(--color-zxaaa-muted)] truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-zxaaa-primary-bg)] text-[var(--color-zxaaa-primary)]">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 rounded-xl">
                        <UserIcon size={16} /> Profile
                      </Link>
                      <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 rounded-xl">
                        <ListOrdered size={16} /> My Orders
                      </Link>
                      <Link to="/wallet" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 rounded-xl">
                        <WalletIcon size={16} /> Wallet
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/5 rounded-xl">
                          <Shield size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <div className="h-px bg-[var(--color-zxaaa-border)] my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition-colors">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link to="/login" className="text-sm font-semibold text-white hover:text-[var(--color-zxaaa-primary)] transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function CategoryBar() {
  return (
    <div className="hidden md:block w-full bg-[var(--color-zxaaa-card2)] border-b border-[var(--color-zxaaa-border)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-6 overflow-x-auto py-3 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat, i) => (
            <Link key={i} to={`/explore?category=${encodeURIComponent(cat.name)}`} className="flex items-center gap-2 text-sm font-medium text-[var(--color-zxaaa-muted)] hover:text-white transition-colors shrink-0">
              {cat.icon}
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-text)]">
      {!isAuthPage && <TopNavbar setLocationModalOpen={setLocationModalOpen} />}
      {!isAuthPage && <CategoryBar />}

      <main className="flex-1 w-full max-w-[1600px] mx-auto pb-20 md:pb-8">
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
          <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/saved-items"    element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />
          <Route path="/orders"         element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/wallet"         element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/settings"       element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>

      {!isAuthPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-zxaaa-border)] flex items-center justify-around h-16 pb-safe"
          style={{ background: 'var(--color-zxaaa-card)', backdropFilter: 'blur(20px)' }}>
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${isActive ? 'text-[var(--color-zxaaa-primary)]' : 'text-[var(--color-zxaaa-muted)]'}`}>
            <HomeIcon size={22} />
            Home
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${isActive ? 'text-[var(--color-zxaaa-primary)]' : 'text-[var(--color-zxaaa-muted)]'}`}>
            <Search size={22} />
            Explore
          </NavLink>
          {/* Center Sell FAB */}
          <Link to="/sell" className="relative -top-5 w-14 h-14 rounded-full text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_6px_20px_var(--color-zxaaa-primary-glow)]" style={{ background: 'var(--color-zxaaa-primary)' }}>
            <Plus size={26} />
          </Link>
          <NavLink to="/notifications" className={({ isActive }) => `relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${isActive ? 'text-[var(--color-zxaaa-primary)]' : 'text-[var(--color-zxaaa-muted)]'}`}>
            <div className="relative">
              <Bell size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
            </div>
            Alerts
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${isActive ? 'text-[var(--color-zxaaa-primary)]' : 'text-[var(--color-zxaaa-muted)]'}`}>
            <div className="relative">
              <MessageSquare size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-zxaaa-primary)]" />
            </div>
            Chat
          </NavLink>
          <NavLink to="/seller/scan-qr" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold transition-colors ${isActive ? 'text-[var(--color-zxaaa-primary)]' : 'text-[var(--color-zxaaa-muted)]'}`}>
            <QrCode size={20} />
            Scan
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold transition-colors ${isActive ? 'text-[var(--color-zxaaa-primary)]' : 'text-[var(--color-zxaaa-muted)]'}`}>
            <UserIcon size={20} />
            Profile
          </NavLink>
        </div>
      )}

      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <MainLayout />
          </Router>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

