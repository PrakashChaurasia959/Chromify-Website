import React, { useState } from 'react'
import {
  Phone,
  Mail,
  Instagram,
  MapPin,
  Send,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react'
import { BUSINESS_INFO } from '../lib/productsData'
import { submitCustomerEnquiry } from '../lib/supabaseClient'

export default function Contact({ prefilledProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: prefilledProduct ? `Hi Chromify, I would like to enquire about the "${prefilledProduct.name}".` : '',
    product_name: prefilledProduct ? prefilledProduct.name : '',
    product_id: prefilledProduct ? prefilledProduct.id : null
  })

  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)

  const validate = () => {
    const errors = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please provide your name (at least 2 characters).'
    }
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 8) {
      errors.phone = 'Please enter a valid phone number (minimum 8 digits).'
    }
    if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
      errors.email = 'Please provide a valid email address.'
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      errors.message = 'Please provide a message or details regarding your enquiry.'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmissionResult(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await submitCustomerEnquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        product_name: formData.product_name,
        product_id: formData.product_id
      })

      setSubmissionResult({
        success: true,
        emailDispatched: res.emailDispatched,
        warning: res.warning,
        message: 'Thank you! Your enquiry has been received successfully.'
      })

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: '',
        product_name: '',
        product_id: null
      })
      setFormErrors({})
    } catch (err) {
      setSubmissionResult({
        success: false,
        message: err.message || 'Something went wrong while submitting your enquiry. Please try again or WhatsApp us directly.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getDirectWhatsAppUrl = () => {
    const text = `Hi Chromify, my name is ${formData.name || 'there'}. I want to enquire about photo frames.`
    return `${BUSINESS_INFO.whatsappBase}?text=${encodeURIComponent(text)}`
  }

  return (
    <section
      id="contact"
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
            <Mail size={16} />
            <span>Get in Touch</span>
          </div>
          <h2 className="section-title">
            Let’s Discuss Your <span className="text-gradient">Frame Requirements</span>
          </h2>
          <p className="section-subtitle">
            Send us an enquiry for custom dimensions, bulk orders, or specific frame styles. We’ll respond promptly with advice and details.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Business Details Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Contact Details Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '8px' }}>
                Chromify Business Office
              </h3>
              <p style={{ color: 'var(--slate-muted)', fontSize: '0.94rem', marginBottom: '28px', lineHeight: 1.6 }}>
                Reach out to us directly through phone, official email, or our Instagram page.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Phone Link */}
                <a
                  href={BUSINESS_INFO.phoneHref}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FAF9F6',
                    transition: 'all 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--purple-soft)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FAF9F6'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(124, 58, 237, 0.1)',
                      color: 'var(--purple-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Phone size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-muted)', fontWeight: 600, display: 'block' }}>
                      Phone & Call Support
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
                      {BUSINESS_INFO.formattedPhone}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                      Click to Call
                    </span>
                  </div>
                </a>

                {/* Email Link */}
                <a
                  href={BUSINESS_INFO.emailHref}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FAF9F6',
                    transition: 'all 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--purple-soft)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FAF9F6'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--blue-electric)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-muted)', fontWeight: 600, display: 'block' }}>
                      Primary Business Email
                    </span>
                    <span style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
                      {BUSINESS_INFO.email}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--purple-primary)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                      Click to Email
                    </span>
                  </div>
                </a>

                {/* Instagram Profile Link */}
                <a
                  href={BUSINESS_INFO.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FAF9F6',
                    transition: 'all 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--pink-soft)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FAF9F6'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(236, 72, 153, 0.1)',
                      color: 'var(--pink-coral)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Instagram size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-muted)', fontWeight: 600, display: 'block' }}>
                      Follow On Instagram
                    </span>
                    <span style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
                      {BUSINESS_INFO.instagramHandle}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--pink-coral)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                      View photos & updates
                    </span>
                  </div>
                </a>

                {/* Physical Address */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FAF9F6'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(249, 115, 22, 0.1)',
                      color: 'var(--orange-warm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-muted)', fontWeight: 600, display: 'block' }}>
                      Studio Location
                    </span>
                    <p style={{ margin: 0, fontSize: '0.94rem', fontWeight: 600, color: 'var(--navy-dark)', lineHeight: 1.5 }}>
                      {BUSINESS_INFO.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action Button */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                <a
                  href={getDirectWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <MessageCircle size={18} />
                  <span>Instant WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: ' clamp(24px, 4vw, 38px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <span className="pill pill-purple" style={{ marginBottom: '8px' }}>
                Online Enquiry Form
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-dark)', margin: '4px 0 6px' }}>
                Send Us a Message
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-muted)' }}>
                Fill out the form below. Enquiries are stored securely and notified to Chromify30@gmail.com.
              </p>
            </div>

            {/* Submission Result Notification */}
            {submissionResult && (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                  background: submissionResult.success ? '#F0FDF4' : '#FEF2F2',
                  border: submissionResult.success ? '1px solid #86EFAC' : '1px solid #FECACA',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                {submissionResult.success ? (
                  <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: submissionResult.success ? '#15803D' : '#991B1B'
                    }}
                  >
                    {submissionResult.message}
                  </p>
                  {submissionResult.warning && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#65A30D' }}>
                      {submissionResult.warning}
                    </p>
                  )}
                  {submissionResult.emailDispatched && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#16A34A', fontWeight: 600 }}>
                      ✓ Email alert dispatched to Chromify30@gmail.com
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Product Reference (if any) */}
              {formData.product_name && (
                <div
                  style={{
                    background: 'var(--purple-soft)',
                    border: '1px solid var(--purple-light)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.86rem', color: 'var(--purple-primary)', fontWeight: 600 }}>
                    Inquiring about: <strong>{formData.product_name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, product_name: '', product_id: null })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate-muted)',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Name Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={submitting}
                />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>

              {/* Phone & Email Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    id="phone"
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
                  <label className="form-label" htmlFor="email">
                    Email Address <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    id="email"
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

              {/* Message Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Message / Frame Requirements <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="form-textarea"
                  placeholder="Tell us about the size you need, photo type, quantity, or any questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={submitting}
                />
                {formErrors.message && <div className="form-error">{formErrors.message}</div>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {submitting ? (
                  <span>Submitting Enquiry...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Enquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
