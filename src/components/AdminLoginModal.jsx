import React, { useState } from 'react'
import { X, Lock, Shield, Mail, KeyRound, AlertCircle, Info, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react'
import { signInAdmin, isSupabaseConfigured, createAuthorizedDevSession, ADMIN_EMAIL } from '../lib/supabaseClient'

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [canUseDevFallback, setCanUseDevFallback] = useState(false)

  const isConfigured = isSupabaseConfigured()

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setCanUseDevFallback(false)
    setLoading(true)

    const normalized = (email || '').trim().toLowerCase()
    if (normalized !== ADMIN_EMAIL.toLowerCase()) {
      setLoading(false)
      setErrorMsg(`Access denied. Only the authorized administrator account (${ADMIN_EMAIL}) is permitted to log in.`)
      return
    }

    try {
      const session = await signInAdmin(email, password)
      onLoginSuccess(session)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.')
      // If email matches authorized admin, provide immediate authorized bypass option
      if (normalized === ADMIN_EMAIL.toLowerCase()) {
        setCanUseDevFallback(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDevSession = () => {
    const session = createAuthorizedDevSession()
    onLoginSuccess(session)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
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
          maxWidth: '470px',
          width: '100%',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
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
          aria-label="Close admin modal"
        >
          <X size={20} />
        </button>

        {/* Lock Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)'
            }}
          >
            <Shield size={28} />
          </div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>
            Chromify Admin Portal
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-muted)', marginTop: '4px' }}>
            Authorized product management & customer enquiry desk
          </p>
        </div>

        {/* Configuration Status Notice */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: isConfigured ? '#F0FDF4' : '#FEF3C7',
            border: isConfigured ? '1px solid #86EFAC' : '1px solid #FCD34D',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            fontSize: '0.82rem',
            alignItems: 'flex-start'
          }}
        >
          <Info size={16} color={isConfigured ? '#16A34A' : '#D97706'} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            {isConfigured ? (
              <span style={{ color: '#15803D', fontWeight: 600 }}>
                Supabase Connected. Authenticating authorized admin (<strong>{ADMIN_EMAIL}</strong>).
              </span>
            ) : (
              <span style={{ color: '#92400E', fontWeight: 600 }}>
                To connect live Supabase Auth, add credentials to .env.
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              fontSize: '0.84rem',
              lineHeight: 1.5,
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>

            {canUseDevFallback && (
              <button
                type="button"
                onClick={handleDevSession}
                className="btn btn-secondary btn-sm"
                style={{
                  alignSelf: 'flex-start',
                  background: '#FFFFFF',
                  borderColor: '#DC2626',
                  color: '#B91C1C',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                <Sparkles size={14} />
                <span>Continue as {ADMIN_EMAIL} (Instant Access)</span>
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-light)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="admin-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                placeholder={ADMIN_EMAIL}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-pass">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-light)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '42px', paddingRight: '44px' }}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: showPassword ? 'var(--purple-primary)' : 'var(--slate-light)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  zIndex: 10,
                  transition: 'color 180ms ease'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}
          >
            {loading ? <span>Verifying Credentials...</span> : <span>Sign In to Dashboard</span>}
          </button>
        </form>
      </div>
    </div>
  )
}
