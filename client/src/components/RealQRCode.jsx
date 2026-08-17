import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon, ShieldCheck } from 'lucide-react';

export default function RealQRCode({
  value,
  title = 'ZXAAA Secure QR Code',
  subtitle = 'Show this QR code to complete physical verification',
  size = 240,
  showDownload = true
}) {
  const [qrSrc, setQrSrc] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!value) return;
    setLoading(true);
    
    // Generate real, high-resolution scannable QR code
    QRCode.toDataURL(value, {
      width: size * 2, // High resolution crisp DPI
      margin: 1.5,
      color: {
        dark: '#0f172a',  // Dark navy dots
        light: '#ffffff'  // Pure white background for maximum camera contrast
      },
      errorCorrectionLevel: 'H' // High error correction level for easy phone camera scanning
    })
      .then(url => {
        setQrSrc(url);
        setLoading(false);
      })
      .catch(err => {
        console.error('Real QR Generation Error:', err);
        setLoading(false);
      });
  }, [value, size]);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrSrc) return;
    const a = document.createElement('a');
    a.href = qrSrc;
    a.download = `ZXAAA-QR-${value.replace(/[^a-zA-Z0-9-]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center p-6 rounded-2xl glass-panel border border-purple-500/30 text-center space-y-4 max-w-sm mx-auto shadow-2xl">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
          <ShieldCheck size={14} /> Real Verified QR Code
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-[var(--color-zxaaa-muted)] mt-0.5">{subtitle}</p>
      </div>

      {/* QR Code Container Box */}
      <div 
        className="relative p-4 rounded-2xl bg-white shadow-xl border-4 border-purple-500/40 flex items-center justify-center transition-all duration-300 hover:scale-[1.02]"
        style={{ width: size, height: size }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <QrIcon size={32} className="animate-spin text-purple-600" />
            <span className="text-xs font-semibold">Generating QR...</span>
          </div>
        ) : qrSrc ? (
          <img 
            src={qrSrc} 
            alt="Real Scannable QR Code" 
            className="w-full h-full object-contain rounded-lg" 
          />
        ) : (
          <div className="text-red-500 text-xs font-semibold">Failed to load QR</div>
        )}
      </div>

      {/* Manual Reference Code */}
      <div className="w-full space-y-2">
        <div className="text-[11px] text-[var(--color-zxaaa-muted)] font-medium">QR Reference Text Code:</div>
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-[var(--color-zxaaa-border)] font-mono text-xs text-purple-300">
          <span className="truncate font-bold tracking-wider">{value}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all shrink-0"
            title="Copy Code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Download Action */}
      {showDownload && qrSrc && (
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all shadow-md shadow-purple-600/30"
        >
          <Download size={15} /> Download Real QR Image (.PNG)
        </button>
      )}
    </div>
  );
}
