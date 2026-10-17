import React from 'react'
import { Sparkles, Palette, Heart, Gift, Compass, Headset, ArrowRight } from 'lucide-react'

export default function WhyChooseUs({ onExploreClick, onContactClick }) {
  const reasons = [
    {
      icon: <Palette size={26} color="#7C3AED" />,
      bg: 'rgba(124, 58, 237, 0.08)',
      title: 'Stylish Frame Designs',
      desc: 'Thoughtfully designed profiles that elevate your photographs from simple prints into eye-catching wall art and sophisticated desktop accents.'
    },
    {
      icon: <Heart size={26} color="#EC4899" />,
      bg: 'rgba(236, 72, 153, 0.08)',
      title: 'Beautiful Memory Displays',
      desc: 'Whether it is a family milestone, baby portrait, wedding photograph, or travel print, our frames are proportioned to give your memories the spotlight they deserve.'
    },
    {
      icon: <Gift size={26} color="#F97316" />,
      bg: 'rgba(249, 115, 22, 0.08)',
      title: 'Thoughtful Gift Ideas',
      desc: 'Frames make meaningful, heartwarming gifts for housewarmings, anniversaries, birthdays, and festive seasons that are cherished for decades.'
    },
    {
      icon: <Compass size={26} color="#2563EB" />,
      bg: 'rgba(37, 99, 235, 0.08)',
      title: 'Different Frame Styles',
      desc: 'Choose from deep 3D shadow boxes with slide-in glass, natural solid teak wood frames, architectural clocks, and coordinated multi-size trio gallery sets.'
    },
    {
      icon: <Headset size={26} color="#059669" />,
      bg: 'rgba(5, 150, 105, 0.08)',
      title: 'Dedicated Customer Assistance',
      desc: 'Friendly guidance on selecting the right dimensions, frame finishes, and wall grid layouts. Reach us directly via phone or WhatsApp for prompt help.'
    }
  ]

  return (
    <section
      id="why-us"
      style={{
        padding: '90px 0',
        background: 'linear-gradient(180deg, #FAF9F6 0%, #F5F3FF 50%, #FAF9F6 100%)',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={16} />
            <span>Why Choose Chromify</span>
          </div>
          <h2 className="section-title">
            Designed for Beauty. <span className="text-gradient">Built to Preserve.</span>
          </h2>
          <p className="section-subtitle">
            We focus on genuine craftsmanship, diverse styling options, and personal service so your walls reflect the moments you treasure most.
          </p>
        </div>

        {/* 5 Cards Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}
        >
          {reasons.map((item, index) => (
            <div
              key={index}
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 26px',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 260ms ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                {item.icon}
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '10px' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '0.93rem', color: 'var(--slate-muted)', lineHeight: 1.65, flexGrow: 1 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Direct Consultation Callout */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #EC4899 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 36px',
            color: '#FFFFFF',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.35)'
          }}
        >
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              Have Questions About Sizes or Frame Styles?
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.96rem', margin: 0 }}>
              Speak with us directly. We are happy to help you choose the right frame for your room or memory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onContactClick}
              className="btn btn-white"
              style={{ fontWeight: 700 }}
            >
              <span>Send An Enquiry</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
