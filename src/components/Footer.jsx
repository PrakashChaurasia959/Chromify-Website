import React from 'react'
import { Phone, Mail, Instagram, MapPin, Heart, ArrowUp } from 'lucide-react'
import { BUSINESS_INFO } from '../lib/productsData'

export default function Footer({ onOpenAdmin }) {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      style={{
        background: '#0F172A',
        color: '#94A3B8',
        paddingTop: '70px',
        paddingBottom: '35px',
        position: 'relative',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '50px'
          }}
        >
          {/* Column 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ width: '20px', height: '20px', border: '2px solid #FFFFFF', borderRadius: '4px' }} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.4rem',
                  color: '#FFFFFF',
                  letterSpacing: '0.02em'
                }}
              >
                CHROMIFY
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#94A3B8', marginBottom: '20px' }}>
              Transforming your favourite moments into beautiful, timeless displays with precision craftsmanship, natural solid wood, and 3D shadow box frames.
            </p>

            <a
              href={BUSINESS_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
            >
              <Instagram size={16} color="#EC4899" />
              <span>{BUSINESS_INFO.instagramHandle}</span>
            </a>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Home', href: '#home' },
                { label: 'About Chromify', href: '#about' },
                { label: 'Product Collections', href: '#collections' },
                { label: '17 Photographs Gallery', href: '#gallery' },
                { label: 'Why Choose Us', href: '#why-us' },
                { label: 'Contact Business', href: '#contact' }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    style={{
                      fontSize: '0.9rem',
                      color: '#94A3B8',
                      transition: 'color 180ms ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Frame Categories */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
              Frame Styles
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                '3D Deep Shadow Box Frames',
                'Solid Natural Teak Wood Frames',
                'Slide-in Top Glazing Frames',
                'Wall Clocks & Accents',
                'Gallery Wall Trio Sets',
                'Custom Dimension Requests'
              ].map((style) => (
                <li key={style} style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                  {style}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
              Business Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <a
                href={BUSINESS_INFO.phoneHref}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CBD5E1' }}
              >
                <Phone size={16} color="#7C3AED" />
                <span>{BUSINESS_INFO.formattedPhone}</span>
              </a>

              <a
                href={BUSINESS_INFO.emailHref}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CBD5E1' }}
              >
                <Mail size={16} color="#3B82F6" />
                <span>{BUSINESS_INFO.email}</span>
              </a>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#94A3B8' }}>
                <MapPin size={16} color="#F97316" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>{BUSINESS_INFO.address}</span>
              </div>

              <div style={{ paddingTop: '8px' }}>
                <button
                  onClick={onOpenAdmin}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 180ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                  }}
                >
                  Admin Management Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '0.86rem'
          }}
        >
          <p style={{ margin: 0 }}>
            © {currentYear} Chromify. All rights reserved. Frame Your Moments. Make Them Timeless.
          </p>

          <button
            onClick={scrollToTop}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFFFFF',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            title="Scroll to top"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--purple-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  )
}
