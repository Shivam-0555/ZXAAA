import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Tag, RefreshCw, MessageSquare, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'swap',
    title: 'Swap Request Received',
    message: 'Rahul wants to swap iPhone 13 Pro with your Sony Headphones.',
    time: '10 mins ago',
    read: false,
    link: '/swap',
    icon: <RefreshCw className="text-purple-400" size={18} />,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: '2',
    type: 'price',
    title: 'Price Drop Alert!',
    message: 'MacBook Air M2 in your wishlist dropped price by ₹3,000.',
    time: '2 hours ago',
    read: false,
    link: '/explore',
    icon: <Tag className="text-emerald-400" size={18} />,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message from Priya',
    message: '"Is the ergonomic office chair still available for pick up?"',
    time: '5 hours ago',
    read: false,
    link: '/messages',
    icon: <MessageSquare className="text-blue-400" size={18} />,
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: '4',
    type: 'system',
    title: 'Identity & Location Verified',
    message: 'Your seller profile trust score increased to 95/100.',
    time: '1 day ago',
    read: true,
    link: '/',
    icon: <Sparkles className="text-amber-400" size={18} />,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: '5',
    type: 'security',
    title: 'Security Alert',
    message: 'New login detected from Vadodara, Gujarat on Chrome.',
    time: '2 days ago',
    read: true,
    link: '/',
    icon: <ShieldAlert className="text-rose-400" size={18} />,
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'swaps') return n.type === 'swap';
    if (activeTab === 'messages') return n.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Bell size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-zxaaa-muted)]">Stay updated on swaps, offers, messages, and account updates</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all self-start sm:self-auto"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-zxaaa-border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'unread'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('swaps')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'swaps'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Swaps
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'messages'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Messages
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 rounded-2xl glass-panel border border-[var(--color-zxaaa-border)]">
            <Bell size={40} className="mx-auto text-[var(--color-zxaaa-muted)] mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-white">No notifications found</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mt-1">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <Link
              key={n.id}
              to={n.link}
              onClick={() => markAsRead(n.id)}
              className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                n.read
                  ? 'bg-black/20 border-[var(--color-zxaaa-border)] opacity-80 hover:opacity-100 hover:border-purple-500/40'
                  : 'bg-purple-950/20 border-purple-500/40 hover:border-purple-500/70 shadow-lg shadow-purple-950/20'
              }`}
            >
              {/* Type Icon */}
              <div className={`p-2.5 rounded-xl border shrink-0 ${n.badgeColor}`}>
                {n.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-semibold truncate ${n.read ? 'text-zinc-200' : 'text-white'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-[var(--color-zxaaa-muted)] shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{n.message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100">
                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50 animate-pulse" />
                )}
                <button
                  onClick={(e) => deleteNotification(n.id, e)}
                  title="Remove notification"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
