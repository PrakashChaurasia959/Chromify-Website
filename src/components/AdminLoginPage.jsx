import React, { useState } from 'react'
import { Shield, Lock, Mail, KeyRound, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, Info } from 'lucide-react'
import { signInAdmin, isSupabaseConfigured, ADMIN_EMAIL } from '../lib/supabaseClient'

export default function AdminLoginPage({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const isConfigured = isSupabaseConfigured()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const normalized = (email || '').trim().toLowerCase()
    if (normalized !== ADMIN_EMAIL.toLowerCase()) {
      setErrorMsg(`Access denied. Only the preconfigured administrator account (${ADMIN_EMAIL}) is permitted to log in. All other accounts are rejected.`)
      return
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your administrator password.')
      return
    }

    setLoading(true)
    try {
      const session = await signInAdmin(email, password)
      if (session) {
        onLoginSuccess(session)
      } else {
        setErrorMsg('Authentication did not return a valid session.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator credentials. Please check your admin password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(ellipse at top, #1E1B4B 0%, #0F172A 50%, #030712 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        color: '#F8FAFC',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Top Navigation Back Link */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px'
        }}
      >
        <button
          onClick={onBackToStore}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-full)',
            color: '#E2E8F0',
            padding: '8px 18px',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 200ms ease',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Storefront</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.15)',
          animation: 'fadeIn 300ms ease-out'
        }}
      >
        {/* Brand & Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)'
            }}
          >
            <Shield size={32} color="#FFFFFF" />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
              background: 'linear-gradient(135deg, #FFFFFF 60%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Chromify Admin Portal
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0 }}>
            Authorized product management & customer enquiry desk
          </p>
        </div>

        {/* Security & Supabase Connection Status Badge */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: '#93C5FD'
          }}
        >
          <Info size={16} color="#60A5FA" style={{ flexShrink: 0 }} />
          <span>
            Connected to Supabase Auth. Access is strictly restricted to <strong>{ADMIN_EMAIL}</strong>.
          </span>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#FCA5A5',
              fontSize: '0.84rem',
              lineHeight: 1.5,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#CBD5E1',
                marginBottom: '8px'
              }}
            >
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Mail size={18} />
              </div>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                required
                placeholder="Chromify30@gmail.com"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '0.94rem',
                  outline: 'none',
                  transition: 'border-color 200ms ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
              />
            </div>
            {email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() && email.length > 0 && (
              <span style={{ fontSize: '0.78rem', color: '#F87171', marginTop: '6px', display: 'block' }}>
                ⚠ Only {ADMIN_EMAIL} is authorized. Other accounts will be rejected.
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#CBD5E1',
                marginBottom: '8px'
              }}
            >
              Administrator Password
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <KeyRound size={18} />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                required
                placeholder="Enter admin password"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '0.94rem',
                  outline: 'none',
                  transition: 'border-color 200ms ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.96rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.75 : 1,
              transition: 'all 200ms ease'
            }}
          >
            <Lock size={18} />
            <span>{loading ? 'Authenticating with Supabase...' : 'Authenticate & Enter Dashboard'}</span>
          </button>
        </form>

        {/* Security Footer Notice */}
        <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
            Row Level Security (RLS) is enforced in PostgreSQL.
            <br />
            Only authenticated session tokens signed for <strong>{ADMIN_EMAIL}</strong> are authorized to mutate data.
          </p>
        </div>
      </div>
    </div>
  )
}
