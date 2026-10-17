import React, { useState } from 'react'
import { Eye, Sparkles, Filter, Maximize2 } from 'lucide-react'
import { INITIAL_PRODUCTS } from '../lib/productsData'

export default function Gallery({ onOpenLightbox }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const filterOptions = [
    'All',
    'Shadow Box Frames',
    'Wooden Photo Frames',
    'Decorative Frames',
    'Gallery Sets'
  ]

  const filteredPhotos = INITIAL_PRODUCTS.filter((item) => {
    if (activeFilter === 'All') return true
    return item.category === activeFilter
  })

  return (
    <section
      id="gallery"
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
            <Sparkles size={16} />
            <span>Showcase Gallery</span>
          </div>
          <h2 className="section-title">
            All 17 Signature <span className="text-gradient">Frame Photographs</span>
          </h2>
          <p className="section-subtitle">
            Explore our complete photograph portfolio showcasing shadow box frames, handcrafted natural teak wood collections, clock designs, and gallery trio sets.
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '40px'
          }}
        >
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: isActive ? '1px solid var(--purple-primary)' : '1px solid #E2E8F0',
                  background: isActive ? 'var(--purple-soft)' : '#FAF9F6',
                  color: isActive ? 'var(--purple-primary)' : 'var(--navy-dark)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                {filter} {filter === 'All' && `(17)`}
              </button>
            )
          })}
        </div>

        {/* 17 Photos Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredPhotos.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(item.image_url, item.name, item.description, index)}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#F1F5F9',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid #E2E8F0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'
                const overlay = e.currentTarget.querySelector('.gallery-overlay')
                if (overlay) overlay.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.borderColor = '#E2E8F0'
                const overlay = e.currentTarget.querySelector('.gallery-overlay')
                if (overlay) overlay.style.opacity = '0'
              }}
            >
              {/* Image Aspect Box */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '110%' }}>
                <img
                  src={item.image_url}
                  alt={item.name}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Photo Index Number Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 9px',
                  borderRadius: 'var(--radius-full)',
                  zIndex: 2
                }}
              >
                Photo #{index + 1}
              </div>

              {/* Hover Dark Overlay with Title and Zoom Icon */}
              <div
                className="gallery-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)',
                  opacity: 0,
                  transition: 'opacity 250ms ease',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  color: '#FFFFFF',
                  zIndex: 3
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
                  }}
                >
                  <Maximize2 size={16} />
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#A78BFA',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {item.category}
                </span>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>
                  {item.name}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
