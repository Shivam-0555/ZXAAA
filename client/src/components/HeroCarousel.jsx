import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    src: '/hero_buying.jpg',
    label: 'Buy Nearby',
    sub: 'Discover products in your area',
  },
  {
    src: '/hero_selling.jpg',
    label: 'Sell Unused Items',
    sub: 'Turn clutter into cash',
  },
  {
    src: '/hero_swapping.jpg',
    label: 'Swap & Exchange',
    sub: 'Trade without spending',
  },
  {
    src: '/hero_local.jpg',
    label: 'Local Marketplace',
    sub: 'Community-powered commerce',
  },
  {
    src: '/hero_electronics.jpg',
    label: 'Electronics & Gadgets',
    sub: 'Phones, laptops & more',
  },
  {
    src: '/hero_furniture.jpg',
    label: 'Furniture & Study Tables',
    sub: 'Home items at great prices',
  },
];

const INTERVAL = 3000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState('next');
  const [animating, setAnimating] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [arrowsVisible, setArrowsVisible] = useState(false);
  const timerRef = useRef(null);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const goTo = useCallback((index, dir = 'next') => {
    if (animating) return;
    setDirection(dir);
    setPrev(current);
    setCurrent(index);
    setAnimating(true);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 500);
  }, [animating, current]);

  const goNext = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 'next');
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev');
  }, [current, goTo]);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goNext();
    }
    if (isRightSwipe) {
      goPrev();
    }
  };

  useEffect(() => {
    if (hovered) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      goNext();
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [hovered, goNext]);

  const slide = SLIDES[current];
  const prevSlide = prev !== null ? SLIDES[prev] : null;

  return (
    <div
      className="hero-carousel-root"
      onMouseEnter={() => { setHovered(true); setArrowsVisible(true); }}
      onMouseLeave={() => { setHovered(false); setArrowsVisible(false); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-carousel-stage">
        {prevSlide && animating && (
          <div
            key={`prev-${prev}`}
            className={`hero-carousel-slide hero-carousel-exit-${direction}`}
          >
            <img src={prevSlide.src} alt={prevSlide.label} className="hero-carousel-img" />
          </div>
        )}

        <div
          key={`curr-${current}`}
          className={`hero-carousel-slide hero-carousel-enter-${direction} ${animating ? '' : 'hero-carousel-settled'}`}
        >
          <img src={slide.src} alt={slide.label} className="hero-carousel-img" />

          <div className="hero-carousel-caption">
            <span className="hero-carousel-caption-dot" />
            <div>
              <p className="hero-carousel-caption-label">{slide.label}</p>
              <p className="hero-carousel-caption-sub">{slide.sub}</p>
            </div>
          </div>
        </div>

        <div className="hero-carousel-glow" />

        <button
          className={`hero-carousel-arrow hero-carousel-arrow-left ${arrowsVisible ? 'hero-carousel-arrow-visible' : ''}`}
          onClick={goPrev}
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          className={`hero-carousel-arrow hero-carousel-arrow-right ${arrowsVisible ? 'hero-carousel-arrow-visible' : ''}`}
          onClick={goNext}
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="hero-carousel-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            id={`hero-carousel-dot-${i}`}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            className={`hero-carousel-dot ${i === current ? 'hero-carousel-dot-active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
