import React, { useState, useEffect } from 'react'
import { X, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { BUSINESS_INFO } from '../lib/productsData'
import { submitCustomerEnquiry } from '../lib/supabaseClient'

export default function EnquiryModal({ isOpen, product, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: `Hi Chromify, I am interested in "${product.name}" (${product.category}). Please share available sizes and pricing.`
      })
      setResult(null)
      setFormErrors({})
    } else if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: 'Hi Chromify, I am interested in custom photo frames. Please share available styles, custom sizes, and pricing.'
      })
      setResult(null)
      setFormErrors({})
    }
  }, [product, isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const getWhatsAppUrl = () => {
    const text = product
      ? `Hi Chromify, I want to enquire about the "${product.name}". Please share details and pricing.`
      : 'Hi Chromify, I want to enquire about custom photo frames and pricing.'
    return `${BUSINESS_INFO.whatsappBase}?text=${encodeURIComponent(text)}`
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please provide your full name.'
    }
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 8) {
      errors.phone = 'Please provide a valid phone number.'
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Please provide a valid email address.'
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      errors.message = 'Please provide enquiry details.'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setResult(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await submitCustomerEnquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        product_name: product ? product.name : 'General Framing Enquiry',
        product_id: product ? product.id : null
      })

      setResult({
        success: true,
        emailDispatched: res.emailDispatched,
        warning: res.warning,
        message: 'Your enquiry has been received! We will connect with you soon.'
      })
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Error submitting enquiry. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          padding: ' clamp(24px, 4vw, 36px)',
          animation: 'slideUp 220ms ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--slate-muted)'
          }}
          aria-label="Close enquiry modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '20px' }}>
          <span className="pill pill-purple" style={{ marginBottom: '8px' }}>
            {product ? 'Product Enquiry' : 'Custom Frame Enquiry'}
          </span>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-dark)', margin: '4px 0' }}>
            {product ? 'Enquire About This Frame' : 'Custom Sizing & Frame Enquiry'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-muted)', margin: 0 }}>
            Connect with Chromify to check availability, customized sizing, and pricing.
          </p>
        </div>

        {/* Product Preview Snippet */}
        {product ? (
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              padding: '12px 14px',
              background: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              marginBottom: '22px'
            }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '10px',
                objectFit: 'cover'
              }}
            />
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--purple-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                {product.category}
              </span>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--navy-dark)', margin: '2px 0 0' }}>
                {product.name}
              </h4>
              <span style={{ fontSize: '0.82rem', color: '#EA580C', fontWeight: 600 }}>
                Price on Request
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              padding: '12px 14px',
              background: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              marginBottom: '22px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              <Send size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--purple-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Chromify Custom Framing
              </span>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--navy-dark)', margin: '2px 0 0' }}>
                Custom Dimensions & Frame Consultations
              </h4>
              <span style={{ fontSize: '0.82rem', color: 'var(--slate-muted)' }}>
                Tell us your memory dimensions and we'll craft the right frame
              </span>
            </div>
          </div>
        )}

        {/* Fast WhatsApp Option */}
        <div style={{ marginBottom: '22px' }}>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <MessageCircle size={18} />
            <span>Fast Enquiry on WhatsApp</span>
          </a>
          <div style={{ textAlign: 'center', margin: '12px 0 0', position: 'relative' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-light)', background: '#FFFFFF', padding: '0 10px', position: 'relative', zIndex: 1 }}>
              or send website message
            </span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#E2E8F0', zIndex: 0 }} />
          </div>
        </div>

        {/* Submission Result */}
        {result && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              background: result.success ? '#F0FDF4' : '#FEF2F2',
              border: result.success ? '1px solid #86EFAC' : '1px solid #FECACA',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}
          >
            {result.success ? (
              <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: result.success ? '#15803D' : '#991B1B' }}>
                {result.message}
              </p>
              {result.warning && (
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#65A30D' }}>
                  {result.warning}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Enquiry Form */}
        {!result?.success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-name">
                Your Name <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <input
                id="modal-name"
                type="text"
                className="form-input"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-phone">
                  Phone Number <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={submitting}
                />
                {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-email">
                  Email <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  id="modal-email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={submitting}
                />
                {formErrors.email && <div className="form-error">{formErrors.email}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modal-message">
                Message <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <textarea
                id="modal-message"
                rows={3}
                className="form-textarea"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={submitting}
              />
              {formErrors.message && <div className="form-error">{formErrors.message}</div>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Product Enquiry</span>
                </>
              )}
            </button>
          </form>
        )}

        {result?.success && (
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '14px', justifyContent: 'center' }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
