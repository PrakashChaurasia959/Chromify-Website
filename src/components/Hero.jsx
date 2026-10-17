import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Layers,
  PhoneCall,
  Compass,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react'
import { BUSINESS_INFO } from '../lib/productsData'

export default function Hero({ onExploreClick, onDiscoverClick, onContactClick, onSelectPhoto }) {
  // Curated Featured Showcase Slides from the authentic 17 photos
  const featuredSlides = [
    {
      idx: 2,
      imageUrl: '/images/WhatsApp Image 2026-10-16 at 10.02.0.jpeg',
      title: 'Signature Matte Black Shadow Box',
      subtitle: 'Architectural 3D depth with anti-glare protective front glass',
      category: 'Shadow Box Frames',
      badge: 'Bestseller Display',
      badgeColor: '#7C3AED'
    },
    {
      idx: 6,
      imageUrl: '/images/WhatsApp Image 2026-10-16 at 10.03..jpeg',
      title: 'Heritage Solid Teak Wood Frame Trio',
      subtitle: '3-piece coordinated organic wood grain set for family walls',
      category: 'Gallery Sets',
      badge: 'Natural Solid Wood',
      badgeColor: '#D97706'
    },
    {
      idx: 0,
      imageUrl: '/images/WhatsApp Image 2026-10-16 at 1.jpeg',
      title: 'Illuminated Deep Shadow Box (Ambient Arc)',
      subtitle: 'Integrated ambient inner glow highlighting precious 3D keepsakes',
      category: 'Shadow Box Frames',
      badge: 'Ambient Lighting',
      badgeColor: '#2563EB'
    },
    {
      idx: 7,
      imageUrl: '/images/WhatsApp Image 2026-10-16 at 10.03.24 AM0.jpeg',
      title: 'Artisanal Handcrafted Solid Wood Wall Clock',
      subtitle: 'Sculpted timber timekeeper and functional art for modern homes',
      category: 'Decorative Frames',
      badge: 'Handcrafted Art',
      badgeColor: '#EC4899'
    },
    {
      idx: 4,
      imageUrl: '/images/WhatsApp Image 2026-10-16 at 10.02.06 AM.jpeg',
      title: 'Easy Slide-In Glass Shadow Box',
      subtitle: 'Top-loading precision slot for zero-tool photo & art swaps',
      category: 'Shadow Box Frames',
      badge: 'Zero-Tool Swap',
      badgeColor: '#16A34A'
    }
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Automatic hero carousel slides with a 4.5-second interval
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSlides.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [isPaused, featuredSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length)
  }

  const activeSlide = featuredSlides[currentSlide]

  return (
    <section
      id="home"
      style={{
        paddingTop: '130px',
        paddingBottom: '90px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FDFBF9 0%, #F5F3FF 45%, #FFFDF7 80%, #FAF9F6 100%)'
      }}
    >
      {/* Decorative ambient glowing orbs with subtle animation */}
      <div
        className="animate-float"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '460px',
          height: '460px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(217, 119, 6, 0.08) 50%, transparent 70%)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        className="animate-float-reverse"
        style={{
          position: 'absolute',
          top: '35%',
          left: '-6%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '25%',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.14) 0%, rgba(249, 115, 22, 0.1) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '52px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Headline and Actions */}
          <div style={{ maxWidth: '620px' }}>
            {/* Top Tag with Subtle Gold & Purple Accent */}
            <div
              className="section-tag"
              style={{
                marginBottom: '22px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(217, 119, 6, 0.12) 100%)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                color: '#92400E'
              }}
            >
              <Sparkles size={16} color="#D97706" />
              <span>Artisanal Wood & 3D Shadow Boxes</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 4.6vw, 3.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                color: 'var(--navy-dark)',
                marginBottom: '22px'
              }}
            >
              Frame Your Moments.{' '}
              <span className="text-gradient">Make Them Timeless.</span>
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.22rem)',
                color: 'var(--slate-muted)',
                lineHeight: 1.65,
                marginBottom: '34px'
              }}
            >
              Discover stylish photo frames that transform your favourite memories into beautiful displays.
              Explore hand-rubbed solid teak frames, deep 3D shadow boxes with slide-in glass, and artisanal wall displays crafted for generations.
            </p>

            {/* Call To Action Buttons: Explore Collection, Discover Our Frames, Contact Us */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center',
                marginBottom: '38px'
              }}
            >
              <button
                onClick={onExploreClick}
                className="btn btn-primary btn-lg"
              >
                <span>Explore Collection</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onDiscoverClick}
                className="btn btn-secondary btn-lg"
                style={{
                  borderColor: 'rgba(217, 119, 6, 0.35)',
                  background: '#FFFFFF'
                }}
              >
                <Compass size={18} color="#D97706" />
                <span>Discover Our Frames</span>
              </button>

              <button
                onClick={onContactClick}
                className="btn btn-secondary btn-lg"
              >
                <PhoneCall size={18} />
                <span>Contact Us</span>
              </button>
            </div>

            {/* Value Highlights Pill Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '18px',
                paddingTop: '22px',
                borderTop: '1px solid rgba(226, 232, 240, 0.85)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(124, 58, 237, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--purple-primary)'
                  }}
                >
                  <Layers size={15} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy-dark)' }}>
                  17 Original Product Photos
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(217, 119, 6, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D97706'
                  }}
                >
                  <ShieldCheck size={15} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy-dark)' }}>
                  Solid Timber & Glass Glazing
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(236, 72, 153, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--pink-coral)'
                  }}
                >
                  <HeartHandshake size={15} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy-dark)' }}>
                  Personal Framing Advice
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Automatic Hero Carousel Showcase */}
          <div
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Main Interactive Carousel Card */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                borderRadius: 'var(--radius-xl)',
                background: '#FFFFFF',
                padding: '14px',
                boxShadow: '0 24px 60px -12px rgba(124, 58, 237, 0.22), 0 0 0 1px rgba(217, 119, 6, 0.12)',
                cursor: 'pointer',
                transition: 'all 300ms ease'
              }}
              onClick={() => onSelectPhoto(activeSlide.idx)}
              title="Click to zoom in Lightbox"
            >
              {/* Carousel Image Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '115%',
                  borderRadius: 'calc(var(--radius-xl) - 6px)',
                  overflow: 'hidden',
                  background: '#0F172A'
                }}
              >
                <img
                  key={activeSlide.imageUrl}
                  src={activeSlide.imageUrl}
                  alt={activeSlide.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 600ms ease'
                  }}
                />

                {/* Floating Category Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(15, 23, 42, 0.82)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 2
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: activeSlide.badgeColor
                    }}
                  />
                  <span>{activeSlide.badge}</span>
                </div>

                {/* Top Right Zoom Hint Button */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}
                  title="View full image in Lightbox"
                >
                  <Maximize2 size={16} />
                </div>

                {/* Carousel Left / Right Arrows */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevSlide()
                  }}
                  aria-label="Previous slide"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--navy-dark)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 3,
                    transition: 'all 180ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)')}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextSlide()
                  }}
                  aria-label="Next slide"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--navy-dark)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 3,
                    transition: 'all 180ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)')}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Card Footer Detail */}
              <div style={{ padding: '16px 10px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-dark)', margin: 0 }}>
                    {activeSlide.title}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--slate-muted)', margin: '2px 0 0' }}>
                    {activeSlide.subtitle}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--purple-primary)',
                    background: 'rgba(124, 58, 237, 0.08)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Price on Request
                </span>
              </div>
            </div>

            {/* Carousel Navigation Indicators (Dots with active expansion) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px'
              }}
            >
              {featuredSlides.map((slide, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    width: currentSlide === idx ? '28px' : '8px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: currentSlide === idx
                      ? 'linear-gradient(135deg, #7C3AED 0%, #D97706 100%)'
                      : '#CBD5E1',
                    cursor: 'pointer',
                    transition: 'all 240ms ease',
                    padding: 0
                  }}
                />
              ))}
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-muted)', marginLeft: '8px' }}>
                Auto-sliding • Click photo to zoom
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
