import { useState } from 'react'
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom'
import { Flame, Shield, Lock, Phone, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { useAuth } from '@/features/auth/model/authContext'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const redirectPath = location.state?.from?.pathname || '/admin'

  // If already logged in, redirect
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      await login(phone, password)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setErrorMessage(
        err.message || 'Invalid administrator credentials. Please check your phone and password.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-orange-500/15 via-red-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top back to store link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Storefront</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand & Security Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex size-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-600 text-white items-center justify-center shadow-lg shadow-orange-600/30 mb-2">
            <Flame size={28} className="fill-white" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Jashore<span className="text-[var(--color-brand)]">Bro</span>
            </h1>
            <Badge variant="unlocked" size="sm" className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Shield size={12} className="text-orange-400" /> Admin
            </Badge>
          </div>

          <p className="text-xs text-slate-400">
            Administrative Management Workspace
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 bg-slate-800/90 border-slate-700/80 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="drop-fire"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-bold gap-2"
            >
              <span>Authenticate & Enter</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Shield size={12} className="text-slate-400" />
              <span>Restricted to authorized staff & store operators.</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
