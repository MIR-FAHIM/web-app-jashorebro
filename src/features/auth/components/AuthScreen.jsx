import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, Lock, User, AtSign, Flame, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { useAuth } from '../model/authContext'
import { authApi } from '../api/authApi'

export function AuthScreen({ onSuccess }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'register' | 'otp'
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Login form state
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '',
    username: '',
    phone: '',
    password: '',
    email: '',
  })

  // OTP form state
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpPurpose, setOtpPurpose] = useState('phone_verification')
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('')

  const redirectPath = location.state?.from?.pathname || '/'

  const handleFinish = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      navigate(redirectPath, { replace: true })
    }
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setFieldErrors({})

    try {
      await login(loginPhone, loginPassword)
      handleFinish()
    } catch (err) {
      if (err.validationErrors) {
        setFieldErrors(err.validationErrors)
      } else {
        setErrorMessage(err.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setFieldErrors({})

    try {
      await register(regForm)
      handleFinish()
    } catch (err) {
      if (err.validationErrors) {
        setFieldErrors(err.validationErrors)
      } else {
        setErrorMessage(err.message || 'Registration failed. Please check your details.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Request OTP
  const handleSendOtp = async (phone) => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await authApi.sendOtp({ phone, purpose: 'phone_verification' })
      setOtpPhone(phone)
      setMode('otp')
      setOtpSuccessMsg(res.message || 'Verification code sent to your phone!')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    try {
      await authApi.verifyOtp({
        phone: otpPhone,
        code: otpCode,
        purpose: otpPurpose,
      })
      alert('Phone verified successfully! You can now log in.')
      setMode('login')
    } catch (err) {
      setErrorMessage(err.message || 'Invalid verification code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto py-6 px-4">
      {/* Brand Icon & Welcome */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-500 text-white shadow-lg shadow-orange-500/25 mb-3">
          <Flame size={28} className="fill-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Jashore<span className="text-[var(--color-brand)]">Bro</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Community drops, collective discounts, and curated taste.
        </p>
      </div>

      <Card className="p-6 shadow-md border-slate-200/90">
        {/* Toggle Mode: Login vs Register */}
        {mode !== 'otp' && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMessage('')
                setFieldErrors({})
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorMessage('')
                setFieldErrors({})
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ─────────────── LOGIN FORM ─────────────── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="017XXXXXXXX or +88017..."
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                error={fieldErrors.phone?.[0]}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                BD Mobile Number (e.g. 017XXXXXXXX)
              </span>
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                error={fieldErrors.password?.[0]}
                required
              />
            </div>

            <Button
              type="submit"
              variant="drop-fire"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Log In to JashoreBro</span>
              <ArrowRight size={16} />
            </Button>

            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  if (loginPhone) {
                    handleSendOtp(loginPhone)
                  } else {
                    setErrorMessage('Please enter your mobile number above first.')
                  }
                }}
                className="text-xs text-[var(--color-brand)] font-semibold hover:underline"
              >
                Log in or verify with Phone OTP →
              </button>
            </div>
          </form>
        )}

        {/* ─────────────── REGISTER FORM ─────────────── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              placeholder="e.g. Fahim Ahmed"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              error={fieldErrors.name?.[0]}
              required
            />

            <Input
              label="Username Handle"
              placeholder="e.g. fahim_vibes"
              value={regForm.username}
              onChange={(e) =>
                setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
              }
              error={fieldErrors.username?.[0]}
              required
            />
            <span className="text-[10px] text-slate-400 -mt-2 block">
              Your public profile will be jashorebro.com/@{regForm.username || 'username'}
            </span>

            <Input
              label="Mobile Number"
              type="tel"
              placeholder="017XXXXXXXX"
              value={regForm.phone}
              onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              error={fieldErrors.normalized_phone?.[0] || fieldErrors.phone?.[0]}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              error={fieldErrors.password?.[0]}
              required
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="you@mail.com"
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              error={fieldErrors.email?.[0]}
            />

            <Button
              type="submit"
              variant="drop-fire"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Create My Account</span>
              <ArrowRight size={16} />
            </Button>
          </form>
        )}

        {/* ─────────────── OTP VERIFICATION FORM ─────────────── */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-2">
              <Badge variant="unlocked" size="md">
                <CheckCircle2 size={13} /> Code Sent
              </Badge>
              <h3 className="text-sm font-bold text-slate-900 mt-2">
                Enter 6-Digit Code
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sent to <strong>{otpPhone}</strong>
              </p>
            </div>

            <Input
              label="Verification Code (OTP)"
              placeholder="123456"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-center font-mono tracking-widest text-lg font-bold"
              required
            />

            <Button
              type="submit"
              variant="drop-fire"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Verify Code
            </Button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-500 hover:text-slate-900"
              >
                ← Back to Login
              </button>
              <button
                type="button"
                onClick={() => handleSendOtp(otpPhone)}
                className="text-[var(--color-brand)] font-bold hover:underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
