import { Link } from 'react-router-dom';

/**
 * Reusable, central Logo component for ZXAAA Marketplace
 * Standardizes sizing, alignment, glow filters, and transparent blending (mixBlendMode: screen)
 */
export default function Logo({
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
  interactive = true,
  className = ''
}) {
  // Sizing definitions
  const sizeMap = {
    xs: { img: 'h-6', text: 'text-base', gap: 'gap-1.5' },
    sm: { img: 'h-8', text: 'text-lg', gap: 'gap-2' },
    md: { img: 'h-10', text: 'text-xl', gap: 'gap-2.5' },
    lg: { img: 'h-14', text: 'text-2xl', gap: 'gap-3' },
    xl: { img: 'h-20', text: 'text-4xl', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const logoContent = (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* Metallic & Electric Blue ZX Icon with blend-mode & glow filter */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/zx-logo.png"
          alt="ZXAAA Logo"
          className={`${currentSize.img} w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]`}
        />
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <span className={`${currentSize.text} font-black tracking-tight gradient-text`}>
            ZXAAA
          </span>
      )}
    </div>
  );

  if (interactive) {
    return (
      <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
