import { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, Bell, ShieldCheck, CreditCard,
  Package, QrCode, Sparkles, AlertCircle
} from 'lucide-react';

const STAGE_CONFIG = [
  {
    key: 'orderCreated',
    label: 'Order Created',
    icon: Sparkles,
    emoji: '🟢',
    description: 'Order request submitted by buyer'
  },
  {
    key: 'sellerNotified',
    label: 'Seller Notified',
    icon: Bell,
    emoji: '🔔',
    description: 'Instant notification dispatched to seller'
  },
  {
    key: 'sellerResponsePending',
    label: 'Seller Response Pending',
    icon: Clock,
    emoji: '⏳',
    description: 'Waiting for seller to review and accept request'
  },
  {
    key: 'sellerAccepted',
    label: 'Seller Accepted',
    icon: ShieldCheck,
    emoji: '✅',
    description: 'Seller accepted the purchase request'
  },
  {
    key: 'paymentConfirmed',
    label: 'Payment Confirmed',
    icon: CreditCard,
    emoji: '💳',
    description: 'Payment verified and secured'
  },
  {
    key: 'pickupReady',
    label: 'Pickup Ready',
    icon: Package,
    emoji: '📦',
    description: 'Item is prepared for meetup/pickup'
  },
  {
    key: 'qrVerified',
    label: 'QR Verified',
    icon: QrCode,
    emoji: '🔐',
    description: 'ZXAAA QR code scanned & verified during meetup'
  },
  {
    key: 'orderCompleted',
    label: 'Order Completed',
    icon: CheckCircle2,
    emoji: '🎉',
    description: 'Transaction finalized and digital bill generated'
  }
];

export default function OrderTimeline({ order, loading, error }) {
  const [countdownText, setCountdownText] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Calculate 2-hour seller countdown
  useEffect(() => {
    if (!order) return;

    // Check if waiting for seller response
    const timeline = order.timeline || {};
    const isSellerAccepted = timeline.sellerAccepted?.status === 'completed' || order.orderStatus === 'COMPLETED';

    if (isSellerAccepted) {
      setCountdownText('');
      return;
    }

    const createdAtStr = timeline.orderCreated?.timestamp || order.createdAt;
    if (!createdAtStr) return;

    const createdTime = new Date(createdAtStr).getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const deadline = createdTime + twoHoursMs;

    const updateCountdown = () => {
      const now = Date.now();
      const diffMs = deadline - now;

      if (diffMs <= 0) {
        setCountdownText('Seller response required within 0h 00m (Time Expired)');
        setIsExpired(true);
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`Seller response required within ${hours}h ${mins}m`);
        setIsExpired(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div className="p-8 rounded-[24px] bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-zxaaa-border)]">
          <div className="h-6 w-48 skeleton rounded-lg" />
          <div className="h-5 w-24 skeleton rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full skeleton shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 skeleton rounded" />
                <div className="h-3 w-1/2 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-[24px] bg-red-500/10 border border-red-500/30 text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
        <h3 className="text-red-400 font-bold text-base">Failed to load order timeline</h3>
        <p className="text-red-300 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 rounded-[24px] bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] text-center text-[var(--color-zxaaa-muted)]">
        No order data available.
      </div>
    );
  }

  const rawTimeline = order.timeline || {};
  const isAllCompleted = order.orderStatus === 'COMPLETED' || rawTimeline.orderCompleted?.status === 'completed';

  // Determine stage status for each of 8 stages
  let firstUncompletedFound = false;

  const computedStages = STAGE_CONFIG.map((cfg) => {
    const rawData = rawTimeline[cfg.key] || {};
    let status = rawData.status || 'pending';
    let timestamp = rawData.timestamp;

    // Derived logic overrides for smooth flow:
    if (cfg.key === 'orderCreated' || cfg.key === 'sellerNotified') {
      status = 'completed';
      if (!timestamp) timestamp = order.createdAt;
    } else if (cfg.key === 'sellerResponsePending') {
      if (rawTimeline.sellerAccepted?.status === 'completed' || isAllCompleted) {
        status = 'completed';
      }
    } else if (isAllCompleted) {
      status = 'completed';
    }

    if (status === 'completed') {
      return { ...cfg, status: 'completed', timestamp };
    }

    if (!firstUncompletedFound) {
      firstUncompletedFound = true;
      return { ...cfg, status: 'current', timestamp };
    }

    return { ...cfg, status: 'pending', timestamp: null };
  });

  const formatTime = (ts) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return null;
    }
  };

  const isPendingSeller = computedStages.find(s => s.key === 'sellerResponsePending' && s.status === 'current');

  return (
    <div
      className="p-6 md:p-8 rounded-[28px] relative overflow-hidden transition-all"
      style={{
        background: 'var(--color-zxaaa-card)',
        border: '1px solid var(--color-zxaaa-border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-zxaaa-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h2 className="text-xl md:text-2xl font-black text-[var(--color-zxaaa-text)] tracking-tight">
              ZXAAA Activity Timeline
            </h2>
          </div>
          <p className="text-xs text-[var(--color-zxaaa-muted)] font-medium mt-1">
            Real-time status updates powered by MongoDB tracking
          </p>
        </div>

        {/* Status indicator pill */}
        <div className="flex items-center gap-2">
          {isAllCompleted ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Completed
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> Live Tracking
            </span>
          )}
        </div>
      </div>

      {/* Countdown Alert Box for Seller Response */}
      {isPendingSeller && countdownText && (
        <div className={`mt-6 p-4 rounded-2xl border flex items-center gap-3 animate-fadeIn ${
          isExpired
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <Clock size={20} className="shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider">Seller 2-Hour Response Window</p>
            <p className="text-sm font-bold mt-0.5">{countdownText}</p>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="mt-8 relative">
        <div className="space-y-6">
          {computedStages.map((stage, idx) => {
            const IconComponent = stage.icon;
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isPending = stage.status === 'pending';
            const timeFormatted = formatTime(stage.timestamp);

            return (
              <div key={stage.key} className="relative flex items-start gap-4 group">
                
                {/* Vertical connecting line */}
                {idx < computedStages.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 bottom-0 w-0.5 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-500/60'
                        : 'bg-[var(--color-zxaaa-border)]'
                    }`}
                    style={{ height: 'calc(100% + 12px)' }}
                  />
                )}

                {/* Node Icon Circle */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border-2 border-emerald-400'
                      : isCurrent
                      ? 'bg-purple-600 text-white ring-4 ring-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.5)] border-2 border-purple-300 scale-110'
                      : 'bg-[var(--color-zxaaa-card2)] text-[var(--color-zxaaa-muted)] border border-[var(--color-zxaaa-border)] opacity-60'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="stroke-[2.5]" />
                  ) : (
                    <IconComponent size={18} className={isCurrent ? 'animate-bounce' : ''} />
                  )}
                </div>

                {/* Content Box */}
                <div
                  className={`flex-1 p-4 rounded-2xl transition-all duration-200 border ${
                    isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : isCurrent
                      ? 'bg-purple-500/10 border-purple-500/40 shadow-lg'
                      : 'bg-[var(--color-zxaaa-card2)]/40 border-[var(--color-zxaaa-border)] opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stage.emoji}</span>
                      <h4
                        className={`text-sm font-black tracking-tight ${
                          isCompleted
                            ? 'text-emerald-400'
                            : isCurrent
                            ? 'text-purple-300'
                            : 'text-[var(--color-zxaaa-muted)]'
                        }`}
                      >
                        {stage.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                          Active Stage
                        </span>
                      )}
                    </div>

                    {timeFormatted && (
                      <span className="text-[11px] font-bold text-[var(--color-zxaaa-muted)] shrink-0">
                        {timeFormatted}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--color-zxaaa-muted)] font-medium mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
