import React, { useState, useMemo } from 'react'
import { Sparkles, MessageCircle, Eye, Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react'
import { CATEGORIES, BUSINESS_INFO } from '../lib/productsData'

export default function Collections({ products, onSelectProduct, onOpenEnquiry, onOpenLightbox }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'All' || prod.category === selectedCategory
      const matchesSearch =
        !searchQuery.trim() ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  const getWhatsAppProductLink = (product) => {
    const text = `Hi Chromify, I am interested in your "${product.name}" (${product.category}). Please share details and pricing.`
    return `${BUSINESS_INFO.whatsappBase}?text=${encodeURIComponent(text)}`
  }

  const getBadgeClass = (category) => {
    if (category.includes('Shadow')) return 'badge-shadow'
    if (category.includes('Wood')) return 'badge-wood'
    if (category.includes('Decorative')) return 'badge-decor'
    if (category.includes('Gallery')) return 'badge-gallery'
    return ''
  }

  return (
    <section
      id="collections"
      style={{
        padding: '90px 0',
        background: '#FAF9F6',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={16} />
            <span>Product Collection</span>
          </div>
          <h2 className="section-title">
            Curated Frames for <span className="text-gradient">Every Style & Space</span>
          </h2>
          <p className="section-subtitle">
            Explore our signature range of artisanal wooden photo frames, 3D deep shadow boxes, and decorative displays. Each piece is crafted with care and built to last.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '40px'
          }}
        >
          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center'
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 'var(--radius-full)',
                    border: active ? '1px solid var(--purple-primary)' : '1px solid #E2E8F0',
                    background: active
                      ? 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)'
                      : '#FFFFFF',
                    color: active ? '#FFFFFF' : 'var(--navy-dark)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    boxShadow: active ? '0 4px 14px rgba(124, 58, 237, 0.25)' : 'var(--shadow-sm)'
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div
            style={{
              maxWidth: '460px',
              margin: '0 auto',
              width: '100%',
              position: 'relative'
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-light)'
              }}
            />
            <input
              type="text"
              placeholder="Search frames by name, style, or size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 18px 11px 44px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-muted)', margin: 0 }}>
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'frame' : 'frames'}
          </p>
          <span style={{ fontSize: '0.85rem', color: 'var(--purple-primary)', fontWeight: 600 }}>
            ✨ Authentic Chromify Product Photographs
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed #CBD5E1'
            }}
          >
            <p style={{ fontSize: '1.1rem', color: 'var(--navy-dark)', fontWeight: 600 }}>
              No frames found matching "{searchQuery}"
            </p>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-muted)', marginTop: '6px' }}>
              Try selecting another category or clear your search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSearchQuery('')
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '14px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '28px'
            }}
          >
            {filteredProducts.map((product) => (
              <div key={product.id || product.slug} className="product-card">
                {/* Image Container with zoom click */}
                <div
                  className="product-image-wrap"
                  onClick={() => {
                    const globalIdx = products.findIndex((p) => (p.id && p.id === product.id) || p.slug === product.slug)
                    onOpenLightbox(product.image_url, product.name, product.description, globalIdx >= 0 ? globalIdx : 0)
                  }}
                  title="Click to view full photo"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback branded placeholder if an image fails
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement.style.background =
                        'linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)'
                    }}
                  />

                  {/* Category Badge */}
                  <span className={`product-badge ${getBadgeClass(product.category)}`}>
                    {product.category}
                  </span>

                  {/* Hover Overlay Hint */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.4)',
                      opacity: 0,
                      transition: 'opacity 250ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                    className="hover-reveal"
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                  >
                    <Eye size={18} />
                    <span>View Photo</span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="product-info">
                  <div className="product-category-label">{product.category}</div>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>

                  {/* Price and Enquire Row */}
                  <div className="product-footer">
                    <div>
                      {product.price && !product.price_on_request ? (
                        <span className="product-price-tag">₹{product.price}</span>
                      ) : (
                        <span className="price-request-pill">Price on Request</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* WhatsApp Fast Enquiry */}
                      <a
                        href={getWhatsAppProductLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '7px 12px', borderRadius: 'var(--radius-full)' }}
                        title="Enquire on WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </a>

                      {/* Direct Modal Enquiry */}
                      <button
                        onClick={() => onOpenEnquiry(product)}
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        <span>Enquire</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
