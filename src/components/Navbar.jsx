import React, { useState, useEffect } from 'react'
import { Menu, X, Phone, Shield, Sparkles, MessageCircle } from 'lucide-react'
import { BUSINESS_INFO } from '../lib/productsData'

export default function Navbar({ onOpenAdmin, onOpenEnquiry }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Collections', href: '#collections' },
    { name: 'Gallery (17)', href: '#gallery' },
    { name: 'Why Choose Us', href: '#why-us' },
    { name: 'Contact', href: '#contact' }
  ]

  const handleLinkClick = (e, href) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 300ms ease',
        background: scrolled
          ? 'rgba(255, 255, 255, 0.92)'
          : 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled
          ? '1px solid rgba(226, 232, 240, 0.8)'
          : '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: scrolled ? '0 4px 20px rgba(15, 23, 42, 0.06)' : 'none'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
        {/* Brand Logo */}
        <a
          href="#home"
          onClick={(e) => handleLinkClick(e, '#home')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 40%, #EC4899 75%, #F97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                border: '2.5px solid #FFFFFF',
                borderRadius: '6px',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  width: '5px',
                  height: '5px',
                  background: '#FFFFFF',
                  borderRadius: '50%'
                }}
              />
            </div>
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.45rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #0F172A 30%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                lineHeight: 1
              }}
            >
              CHROMIFY
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--purple-primary)',
                textTransform: 'uppercase',
                display: 'block',
                marginTop: '2px'
              }}
            >
              Premium Photo Frames
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              style={{
                fontSize: '0.94rem',
                fontWeight: 600,
                color: 'var(--navy-slate)',
                transition: 'color 180ms ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--purple-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--navy-slate)')}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          <button
            onClick={onOpenAdmin}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', gap: '6px' }}
            title="Manage Products & Enquiries"
          >
            <Shield size={16} />
            Admin
          </button>

          <a
            href={BUSINESS_INFO.whatsappBase}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            color: 'var(--navy-dark)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid var(--slate-border)',
            padding: '20px 24px 28px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--navy-dark)',
                padding: '8px 0',
                borderBottom: '1px solid #F1F5F9'
              }}
            >
              {link.name}
            </a>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenAdmin()
              }}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Shield size={16} />
              Admin Portal
            </button>

            <a
              href={BUSINESS_INFO.whatsappBase}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Responsive Styles Injection */}
      <style>{`
        @media (min-width: 960px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  )
}
