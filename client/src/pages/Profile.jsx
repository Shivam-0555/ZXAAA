import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';
import {
  User as UserIcon, Mail, Phone, MapPin, ShieldCheck,
  Package, RefreshCw, Edit3, Check, Camera,
  QrCode, Heart, ListOrdered, Wallet as WalletIcon, Copy,
  CheckCircle2, Sparkles, LogOut, Clock, Trash2, Upload,
  CreditCard, AlertCircle, ExternalLink, Smartphone,
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    city: '',
    profileImage: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);

  // UPI Payment Settings state
  const [upiInput, setUpiInput] = useState('');
  const [upiSaving, setUpiSaving] = useState(false);
  const [upiMsg, setUpiMsg] = useState({ type: '', text: '' });
  const [upiPreviewQr, setUpiPreviewQr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', config);
        const userData = data.data || user;
        setProfileData(userData);
        setEditForm({
          name: userData.name || '',
          phone: userData.phone || '',
          city: userData.city || '',
          profileImage: userData.profileImage || '',
        });
        // Pre-fill UPI input from saved profile
        setUpiInput(userData.upiId || '');
        // If they already have a UPI ID, generate preview QR
        if (userData.upiId) {
          generateUpiPreviewQr(userData.upiId, userData.name);
        }
      } catch (err) {
        setProfileData(user);
        setEditForm({
          name: user.name || '',
          phone: user.phone || '',
          city: user.city || '',
          profileImage: user.profileImage || '',
        });
        setUpiInput(user.upiId || '');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Handle direct file upload from camera icon or edit panel
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      setEditForm(prev => ({ ...prev, profileImage: base64Image }));
      
      // Auto-save direct avatar uploads if not in editing mode
      if (!isEditing) {
        setSaveLoading(true);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.put('http://localhost:5000/api/auth/profile', {
            profileImage: base64Image
          }, config);
          
          setProfileData(prev => ({ ...prev, ...data.data }));
          const currentStored = JSON.parse(localStorage.getItem('userInfo') || '{}');
          localStorage.setItem('userInfo', JSON.stringify({ ...currentStored, ...data.data }));
          setSuccessMsg('Profile photo updated successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          setErrorMsg('Failed to update photo');
        } finally {
          setSaveLoading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', editForm, config);
      
      setProfileData(prev => ({ ...prev, ...data.data }));
      
      // Update local storage
      const currentStored = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...currentStored, ...data.data }));
      
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setEditForm(prev => ({ ...prev, profileImage: '' }));
  };

  const copyReferral = () => {
    if (currentUser?.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2500);
    }
  };

  // Generate a preview QR for the seller's own UPI ID
  const generateUpiPreviewQr = async (upiId, name) => {
    if (!upiId) { setUpiPreviewQr(''); return; }
    try {
      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name || 'Me')}&cu=INR`;
      const url = await QRCode.toDataURL(upiString, {
        width: 320, margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });
      setUpiPreviewQr(url);
    } catch (e) {
      setUpiPreviewQr('');
    }
  };

  const handleSaveUpi = async () => {
    const trimmed = upiInput.trim();
    // Validate format
    if (trimmed && !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(trimmed)) {
      setUpiMsg({ type: 'error', text: 'Invalid UPI ID. Expected format: yourname@bankname (e.g. user@upi)' });
      return;
    }
    setUpiSaving(true);
    setUpiMsg({ type: '', text: '' });
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', { upiId: trimmed }, config);
      setProfileData(prev => ({ ...prev, upiId: data.data.upiId }));
      const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...stored, upiId: data.data.upiId }));
      setUpiMsg({ type: 'success', text: trimmed ? 'UPI ID saved successfully!' : 'UPI ID removed.' });
      await generateUpiPreviewQr(trimmed, currentUser?.name);
      setTimeout(() => setUpiMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setUpiMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save UPI ID' });
    } finally {
      setUpiSaving(false);
    }
  };

  const handleCopyUpi = () => {
    if (!upiInput.trim()) return;
    navigator.clipboard.writeText(upiInput.trim());
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[var(--color-zxaaa-primary-bg)] border border-[var(--color-zxaaa-primary-glow)]">
          <UserIcon size={36} className="text-[var(--color-zxaaa-primary)]" />
        </div>
        <h2 className="text-2xl font-black text-[var(--color-zxaaa-text)] mb-2">Login to View Profile</h2>
        <p className="text-[var(--color-zxaaa-muted)] mb-6 text-center max-w-sm font-bold">
          Sign in to access your personal dashboard, edit details, and track your marketplace Trust Score.
        </p>
        <Link to="/login" className="btn-primary px-8 py-3">Sign In</Link>
      </div>
    );
  }

  const currentUser = profileData || user;
  const displayImage = isEditing ? editForm.profileImage : currentUser.profileImage;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4">
      
      {/* Hidden file input for avatar click */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* ── Top Header Hero Card ── */}
      <div className="relative rounded-[28px] p-6 sm:p-10 overflow-hidden shadow-2xl"
        style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        
        {/* Accent Glow */}
        <div className="absolute top-0 left-0 w-full h-1.5"
          style={{ background: 'linear-gradient(90deg, var(--color-zxaaa-primary), #3b82f6)' }} />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-zxaaa-primary-glow) 0%, transparent 70%)', opacity: 0.25 }} />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            
            {/* Interactive Avatar with Camera Upload */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[26px] overflow-hidden flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-2xl cursor-pointer relative border-2 border-[var(--color-zxaaa-border)] hover:border-[var(--color-zxaaa-primary)] transition-all"
                style={{ background: 'linear-gradient(135deg, var(--color-zxaaa-primary), #2563eb)' }}
                title="Click to change profile photo"
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  currentUser.name?.charAt(0).toUpperCase() || 'U'
                )}

                {/* Hover overlay on avatar */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                  <Camera size={22} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Change</span>
                </div>
              </div>

              {/* Verified badge */}
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-emerald-500 text-white shadow-md" title="Verified User">
                <ShieldCheck size={16} />
              </div>
            </div>

            {/* Name, Email, Phone, City */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-zxaaa-text)]">{currentUser.name || 'User'}</h1>
                {currentUser.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[var(--color-zxaaa-primary-bg)] text-[var(--color-zxaaa-primary)] border border-[var(--color-zxaaa-primary-glow)]">
                    Admin
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Verified Account
                </span>
              </div>

              {/* Direct Email & Phone Display */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-y-1.5 gap-x-4 text-xs font-bold text-[var(--color-zxaaa-muted)]">
                <span className="flex items-center gap-1.5 text-[var(--color-zxaaa-text)]">
                  <Mail size={14} className="text-[var(--color-zxaaa-primary)]" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1.5 text-[var(--color-zxaaa-text)]">
                  <Phone size={14} className="text-emerald-400" />
                  {currentUser.phone || 'Not specified'}
                </span>
                <span className="flex items-center gap-1.5 text-[var(--color-zxaaa-muted)]">
                  <MapPin size={14} className="text-rose-400" />
                  {currentUser.city || 'Not specified'}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1 justify-center sm:justify-start">
                <p className="text-[11px] font-bold text-[var(--color-zxaaa-muted)]">
                  Member since {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2026'}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-black text-[var(--color-zxaaa-primary)] hover:underline flex items-center gap-1"
                >
                  <Camera size={12} /> Upload Photo
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background: isEditing ? 'var(--color-zxaaa-border)' : 'var(--color-zxaaa-primary)', boxShadow: isEditing ? 'none' : '0 4px 14px var(--color-zxaaa-primary-glow)' }}
            >
              <Edit3 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Success / Error Alerts ── */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* ── Edit Profile Form Panel ── */}
      {isEditing && (
        <div className="rounded-[24px] p-6 sm:p-8 animate-in slide-in-from-top-4 duration-300 space-y-6"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-primary-glow)' }}>
          <h3 className="text-lg font-black text-[var(--color-zxaaa-text)] flex items-center gap-2">
            <Edit3 size={18} className="text-[var(--color-zxaaa-primary)]" /> Update Personal Information & Photo
          </h3>

          {/* Profile Photo Section inside Edit Form */}
          <div className="p-4 rounded-2xl bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] space-y-4">
            <label className="block text-xs font-black text-[var(--color-zxaaa-text)] uppercase tracking-wider flex items-center gap-2">
              <Camera size={14} className="text-[var(--color-zxaaa-primary)]" /> PROFILE PICTURE / AVATAR
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Preview */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-black text-white shrink-0 bg-[var(--color-zxaaa-primary)] border border-white/10">
                {editForm.profileImage ? (
                  <img src={editForm.profileImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  editForm.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>

              {/* Upload actions */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-zxaaa-text)] bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] hover:border-[var(--color-zxaaa-primary)] transition-colors"
                  >
                    <Upload size={14} /> Choose Image from Device
                  </button>

                  {editForm.profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>

                {/* Paste image URL */}
                <div>
                  <input
                    type="url"
                    placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                    value={editForm.profileImage}
                    onChange={e => setEditForm({ ...editForm, profileImage: e.target.value })}
                    className="w-full bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-2 text-xs text-[var(--color-zxaaa-text)] placeholder:text-[var(--color-zxaaa-muted)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-[var(--color-zxaaa-text)] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-zxaaa-text)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--color-zxaaa-text)] uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-zxaaa-text)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--color-zxaaa-text)] uppercase tracking-wider mb-2">
                  City / Location
                </label>
                <input
                  type="text"
                  required
                  value={editForm.city}
                  onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-zxaaa-text)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-zxaaa-border)]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--color-zxaaa-muted)] hover:text-[var(--color-zxaaa-text)] bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="btn-primary px-6 py-2.5 text-xs font-black flex items-center gap-1.5"
              >
                {saveLoading ? 'Saving...' : <><Check size={14} /> Save Profile Changes</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Payment Settings — UPI ID ── */}
      <div className="rounded-[24px] p-6 sm:p-8 space-y-6"
        style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)', border: '1px solid #7c3aed44' }}>
            <CreditCard size={18} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-[var(--color-zxaaa-text)]">Payment Settings — UPI ID</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] font-bold">Used to receive payments from buyers. Never shared without your knowledge.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Input + controls */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-black text-[var(--color-zxaaa-text)] uppercase tracking-wider mb-2">
                Your UPI ID
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="upi-id-input"
                  type="text"
                  placeholder="e.g. yourname@upi or 9876543210@ybl"
                  value={upiInput}
                  onChange={e => setUpiInput(e.target.value)}
                  className="flex-1 bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-zxaaa-text)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] font-mono placeholder:text-[var(--color-zxaaa-muted)] placeholder:font-sans placeholder:not-italic"
                />
                {upiInput.trim() && (
                  <button
                    id="btn-copy-upi"
                    type="button"
                    onClick={handleCopyUpi}
                    title="Copy UPI ID"
                    className="shrink-0 p-3 rounded-xl transition-all"
                    style={{ background: 'var(--color-zxaaa-card2)', border: '1px solid var(--color-zxaaa-border)', color: copiedUpi ? '#34d399' : 'var(--color-zxaaa-muted)' }}
                  >
                    {copiedUpi ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-zxaaa-muted)] mt-1.5 font-bold">
                Accepted formats: <span className="font-mono text-[var(--color-zxaaa-text)]">name@upi · name@ybl · name@okaxis · 9876543210@paytm</span>
              </p>
            </div>

            {/* Status message */}
            {upiMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                upiMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {upiMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                {upiMsg.text}
              </div>
            )}

            <button
              id="btn-save-upi"
              type="button"
              onClick={handleSaveUpi}
              disabled={upiSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
              style={{ background: 'var(--color-zxaaa-primary)', boxShadow: '0 4px 14px var(--color-zxaaa-primary-glow)' }}
            >
              {upiSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {upiSaving ? 'Saving...' : 'Save UPI ID'}
            </button>

            {/* Security notice */}
            <div className="p-3 rounded-xl flex items-start gap-2.5"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-[var(--color-zxaaa-muted)] font-bold leading-relaxed">
                <span className="text-amber-400">Security: </span>
                ZXAAA stores your UPI ID to generate payment QR codes for buyers.
                Your UPI PIN is <strong className="text-white">never</strong> asked, collected, or stored.
                Do not enter your PIN anywhere on this platform.
              </div>
            </div>
          </div>

          {/* Preview QR */}
          {upiPreviewQr && upiInput.trim() && (
            <div className="flex flex-col items-center gap-3 shrink-0">
              <p className="text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider">Your UPI QR Preview</p>
              <div className="p-4 rounded-2xl bg-white shadow-xl border-4 flex items-center justify-center"
                style={{ borderColor: 'var(--color-zxaaa-primary-glow)', width: 160, height: 160 }}>
                <img src={upiPreviewQr} alt="Your UPI QR" className="w-full h-full object-contain rounded-lg" />
              </div>
              <p className="text-[10px] text-[var(--color-zxaaa-muted)] text-center max-w-[140px] leading-tight">
                This is how buyers will see your payment QR
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Trust Score & Response Rate Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Trust Score */}
        <div className="rounded-[20px] p-5 relative overflow-hidden"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider">ZXAAA Trust Score</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{currentUser.trustScore || 95}</span>
            <span className="text-xs font-bold text-[var(--color-zxaaa-muted)]">/ 100</span>
          </div>
          <p className="text-[11px] font-bold text-[var(--color-zxaaa-muted)] mt-2">
            High Reputation Seller & Buyer
          </p>
        </div>

        {/* 2-Hour Response Guarantee */}
        <div className="rounded-[20px] p-5 relative overflow-hidden"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider">Response Rate</span>
            <Clock size={18} className="text-[var(--color-zxaaa-primary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--color-zxaaa-text)]">{currentUser.twoHourResponseRate || 98}%</span>
            <span className="text-xs font-bold text-emerald-400 font-bold">&lt; 2 hours</span>
          </div>
          <p className="text-[11px] font-bold text-[var(--color-zxaaa-muted)] mt-2">
            Meets the 2-Hour Response Badge
          </p>
        </div>

        {/* Wallet Points */}
        <div className="rounded-[20px] p-5 relative overflow-hidden"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[var(--color-zxaaa-muted)] uppercase tracking-wider">ZXAAA Wallet</span>
            <WalletIcon size={18} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">₹{currentUser.walletPoints || 250}</span>
            <span className="text-xs font-bold text-[var(--color-zxaaa-muted)]">Credits</span>
          </div>
          <p className="text-[11px] font-bold text-[var(--color-zxaaa-muted)] mt-2">
            Available for platform transactions
          </p>
        </div>
      </div>

      {/* ── Quick Action Shortcuts ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/orders" className="p-4 rounded-[20px] flex flex-col items-center gap-2.5 text-center transition-all hover:scale-105"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--color-zxaaa-primary)] bg-[var(--color-zxaaa-primary-bg)]">
            <ListOrdered size={20} />
          </div>
          <span className="text-xs font-bold text-[var(--color-zxaaa-text)]">My Orders</span>
        </Link>

        <Link to="/saved-items" className="p-4 rounded-[20px] flex flex-col items-center gap-2.5 text-center transition-all hover:scale-105"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-rose-400 bg-rose-500/10">
            <Heart size={20} />
          </div>
          <span className="text-xs font-bold text-[var(--color-zxaaa-text)]">Saved Items</span>
        </Link>

        <Link to="/swap" className="p-4 rounded-[20px] flex flex-col items-center gap-2.5 text-center transition-all hover:scale-105"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-emerald-400 bg-emerald-500/10">
            <RefreshCw size={20} />
          </div>
          <span className="text-xs font-bold text-[var(--color-zxaaa-text)]">Swap Center</span>
        </Link>

        <Link to="/seller/scan-qr" className="p-4 rounded-[20px] flex flex-col items-center gap-2.5 text-center transition-all hover:scale-105"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-blue-400 bg-blue-500/10">
            <QrCode size={20} />
          </div>
          <span className="text-xs font-bold text-[var(--color-zxaaa-text)]">Scan QR</span>
        </Link>
      </div>

      {/* ── Referral Code & Account Actions ── */}
      <div className="rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h4 className="text-base font-black text-[var(--color-zxaaa-text)]">Your Referral Code</h4>
          </div>
          <p className="text-xs font-bold text-[var(--color-zxaaa-muted)]">
            Share with friends and earn 50 wallet credits on their first trade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-xl font-mono text-sm font-black text-[var(--color-zxaaa-text)] bg-[var(--color-zxaaa-card2)] border border-[var(--color-zxaaa-border)] tracking-wider">
            {currentUser.referralCode || `ZX-${(currentUser._id || 'USER').substring(0, 6).toUpperCase()}`}
          </div>
          <button
            onClick={copyReferral}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--color-zxaaa-primary)' }}
          >
            {copiedReferral ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div className="text-center pt-4">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
        >
          <LogOut size={14} /> Sign Out of Account
        </button>
      </div>

    </div>
  );
};

export default Profile;
