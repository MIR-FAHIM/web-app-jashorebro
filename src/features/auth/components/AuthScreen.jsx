import React, { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useAuth } from '../model/authContext'

export function AuthScreen({ onSuccess }) {
  const { login } = useAuth()
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('identifier') // 'identifier' | 'otp'
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOtp = (e) => {
    e.preventDefault()
    if (!phoneOrEmail) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('otp')
    }, 500)
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      login(
        {
          id: 'user_1',
          name: 'Fahim Ahmed',
          handle: 'fahim_vibes',
          phone: phoneOrEmail,
          role: 'user',
        },
        'mock_token_123'
      )
      setIsLoading(false)
      if (onSuccess) onSuccess()
    }, 500)
  }

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-100 text-[var(--color-brand)] font-extrabold text-xl mb-3">
        JB
      </div>
      <h2 className="text-xl font-bold text-slate-900">Welcome to JashoreBro</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6">
        Community drops, curated picks, collective value.
      </p>

      {step === 'identifier' ? (
        <form onSubmit={handleSendOtp} className="space-y-4 text-left">
          <Input
            label="Phone or Email"
            placeholder="017XXXXXXXX or you@mail.com"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4 text-left">
          <Input
            label="Enter Verification Code"
            placeholder="6-digit OTP (e.g. 123456)"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Button type="submit" variant="drop-fire" className="w-full" isLoading={isLoading}>
            Verify & Enter
          </Button>
          <button
            type="button"
            onClick={() => setStep('identifier')}
            className="w-full text-xs text-slate-500 hover:text-slate-800 text-center"
          >
            ← Change phone or email
          </button>
        </form>
      )}
    </div>
  )
}
