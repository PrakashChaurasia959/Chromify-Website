import React, { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Lightbox({ isOpen, photo, onNext, onPrev, onClose }) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onNext, onPrev, onClose])

  if (!isOpen || !photo) return null

  return (
    <div
      className="lightbox-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="lightbox-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="lightbox-close"
          aria-label="Close image preview"
        >
          <X size={22} />
        </button>

        {/* Previous Navigation */}
        <button
          onClick={onPrev}
          className="lightbox-nav lightbox-prev"
          aria-label="Previous photograph"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Next Navigation */}
        <button
          onClick={onNext}
          className="lightbox-nav lightbox-next"
          aria-label="Next photograph"
        >
          <ChevronRight size={24} />
        </button>

        {/* Image Wrap */}
        <div className="lightbox-img-wrap">
          <img
            src={photo.image_url}
            alt={photo.name || 'Chromify product photograph'}
          />
        </div>

        {/* Caption */}
        <div className="lightbox-caption">
          {photo.category && (
            <span
              style={{
                fontSize: '0.78rem',
                color: '#A78BFA',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              {photo.category}
            </span>
          )}
          <h3 className="lightbox-title">{photo.name}</h3>
          {photo.description && <p className="lightbox-desc">{photo.description}</p>}
        </div>
      </div>
    </div>
  )
}
