import React from 'react'
import { Frame, Box, Sparkles, Layers, CheckCircle2 } from 'lucide-react'

export default function About({ onExploreClick }) {
  const frameCategories = [
    {
      icon: <Box size={24} color="#7C3AED" />,
      title: 'Shadow Box Frames',
      desc: 'Engineered with deep interior cavities, precision side grooves, and easy slide-in glass for displaying 3D keepsakes, layered crafts, and memorabilia.'
    },
    {
      icon: <Frame size={24} color="#2563EB" />,
      title: 'Solid Wooden Frames',
      desc: 'Crafted from hand-selected natural timber with rich grain textures. Available in standard gallery dimensions (6×8", 8×12", 12×18") and custom proportions.'
    },
    {
      icon: <Sparkles size={24} color="#EC4899" />,
      title: 'Decorative Frames & Accents',
      desc: 'Statement decorative pieces including artisanal solid wood wall clocks and architectural triangular easel shelves that elevate any room.'
    },
    {
      icon: <Layers size={24} color="#F97316" />,
      title: 'Glass & Passe-Partout Mounts',
      desc: 'Archival cream-white mat borders with crystal-clear protective glazing to ensure your photographs remain vivid and timeless.'
    }
  ]

  return (
    <section
      id="about"
      style={{
        padding: '90px 0',
        background: '#FFFFFF',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span>About Chromify</span>
          </div>
          <h2 className="section-title">
            Crafting the Home for Your <span className="text-gradient">Most Cherished Moments</span>
          </h2>
          <p className="section-subtitle">
            Chromify is dedicated to bringing style, elegance, and durability to your memory displays.
            From deep 3D shadow boxes to artisanal solid wood frames, each piece is designed to showcase your moments with timeless perfection.
          </p>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '60px'
          }}
        >
          {frameCategories.map((cat, idx) => (
            <div
              key={idx}
              style={{
                background: '#FAF9F6',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                borderRadius: 'var(--radius-lg)',
                padding: '30px 24px',
                transition: 'all 240ms ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                {cat.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--navy-dark)' }}>
                {cat.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--slate-muted)', lineHeight: 1.6 }}>
                {cat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Story / Craft Showcase Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #172554 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: ' clamp(30px, 5vw, 50px)',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '36px',
            alignItems: 'center'
          }}
        >
          {/* Subtle colorful overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}
          />

          <div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#A78BFA',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              Our Commitment
            </span>
            <h3
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: '16px'
              }}
            >
              Real Craftsmanship, Tailored for Every Wall
            </h3>
            <p style={{ color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.65, marginBottom: '24px' }}>
              We understand that behind every photograph is an irreplaceable story — family smiles, milestone celebrations, fine art prints, and sacred moments. Chromify designs frames that honor these memories with clean aesthetics and structural longevity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#22C55E" />
                <span style={{ fontSize: '0.94rem', color: '#F1F5F9' }}>
                  Hand-inspected corners and durable joint construction
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#22C55E" />
                <span style={{ fontSize: '0.94rem', color: '#F1F5F9' }}>
                  Slide-in top glass for effortless photo changes
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#22C55E" />
                <span style={{ fontSize: '0.94rem', color: '#F1F5F9' }}>
                  Personalized advice for gallery walls and gifting
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                width: '100%',
                maxWidth: '380px'
              }}
            >
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', marginBottom: '8px' }}>
                Looking for a Custom Size?
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Have specific artwork, poster dimensions, or 3D object display needs? Connect with our team for custom framing recommendations.
              </p>
              <button
                onClick={onExploreClick}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Browse All Frames
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
