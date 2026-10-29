import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, ArrowRight, BookmarkPlus, Users, ShoppingBag } from 'lucide-react'
import { ModalFrame } from '@/shared/ui/ModalFrame'
import { Button } from '@/shared/ui/Button'
import { useAuth } from '@/features/auth/model/authContext'

const PENDING_KEY = 'jb_login_welcome_pending'
const DISMISSED_KEY = 'jb_login_welcome_dismissed'

export function LoginWelcomeModal() {
  const { isAuthenticated, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Function to show the modal
  const triggerModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  // Check storage flag on mount, on auth change, or on custom login event
  useEffect(() => {
    // 1. Direct URL override (for easy testing: ?welcome=true)
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('welcome') === 'true') {
      setIsOpen(true)
      return
    }

    // 2. Pending login flag check
    const isPending = sessionStorage.getItem(PENDING_KEY) === 'true'
    const isDismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true'

    if (isAuthenticated && isPending && !isDismissed) {
      setIsOpen(true)
    }

    // 3. Listen to live login event in current tab
    const handleLoginEvent = () => {
      sessionStorage.setItem(PENDING_KEY, 'true')
      sessionStorage.removeItem(DISMISSED_KEY)
      setIsOpen(true)
    }

    window.addEventListener('jb:login-success', handleLoginEvent)
    window.addEventListener('jb:show-welcome-modal', triggerModal)

    return () => {
      window.removeEventListener('jb:login-success', handleLoginEvent)
      window.removeEventListener('jb:show-welcome-modal', triggerModal)
    }
  }, [isAuthenticated, location.search, triggerModal])

  const handleDismiss = () => {
    sessionStorage.removeItem(PENDING_KEY)
    if (user?.id) {
      sessionStorage.setItem(`${DISMISSED_KEY}_${user.id}`, 'true')
    }
    sessionStorage.setItem(DISMISSED_KEY, 'true')
    setIsOpen(false)
  }

  const handleGetStarted = () => {
    handleDismiss()
    if (location.pathname === '/login' || location.pathname === '/auth') {
      navigate('/')
    }
  }

  if (!isOpen) return null

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={handleDismiss}
      className="max-w-lg p-5 sm:p-7 bg-surface border-line"
    >
      <div className="space-y-5">
        {/* Top Header & Visual Badge */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles size={13} className="text-brand animate-pulse" />
            <span>Picks & Friends</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight leading-snug">
            বন্ধুত্ব হোক কেনাকাটার নতুন শক্তি! 🛍️🤝
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-soft leading-relaxed max-w-md mx-auto">
            JashoreBro-তে পণ্য খুঁজুন, <span className="text-ink font-semibold">My Picks</span>-এ নিজের পছন্দ সাজান আর <span className="text-brand font-semibold">Friends’ Picks</span> থেকে বন্ধুদের রেকমেন্ডেশন দেখুন।
          </p>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="space-y-3">
          {/* Pillar 1: Product discovery */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-line bg-elevated/70 hover:border-brand/40 transition-colors">
            <div className="size-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <ShoppingBag size={20} className="text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-ink">
                  আপনার পরের পছন্দ খুঁজুন
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  Product Picks
                </span>
              </div>
              <p className="text-xs text-soft mt-1 leading-relaxed">
                নতুন পণ্য দেখুন, বিস্তারিত জানুন আর কমিউনিটির মতামত পড়ে আপনার জন্য সঠিক পণ্য বেছে নিন।
              </p>
            </div>
          </div>

          {/* Pillar 2: Personal picks */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-line bg-elevated/70 hover:border-brand/40 transition-colors">
            <div className="size-11 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 shadow-xs">
              <BookmarkPlus size={20} className="text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-ink">
                  নিজের পছন্দ সাজান
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                  My Picks
                </span>
              </div>
              <p className="text-xs text-soft mt-1 leading-relaxed">
                পছন্দের পণ্য My Picks-এ রাখুন, কেন ভালো লেগেছে তা লিখুন এবং আপনার পিকস বন্ধুদের সাথে শেয়ার করুন।
              </p>
            </div>
          </div>

          {/* Pillar 3: Social Circle */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-line bg-elevated/70 hover:border-brand/40 transition-colors">
            <div className="size-11 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
              <Users size={20} className="text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-ink">
                  বন্ধুদের সাথে কানেক্ট থাকুন
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  Friends’ Picks
                </span>
              </div>
              <p className="text-xs text-soft mt-1 leading-relaxed">
                ফ্রেন্ডদের পছন্দের পণ্য দেখুন, সাজেস্ট করুন এবং রিয়েল রিভিউ দিয়ে একসাথে স্মার্ট শপিং এক্সপ্লোর করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Brand Community Callout */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-brand/30 p-3.5 text-center shadow-xs">
          <p className="text-xs sm:text-sm font-extrabold text-ink">
            ✨ JashoreBro — Your Picks. Your Friends. Better Finds.
          </p>
        </div>

        {/* Actions / Skippable CTAs */}
        <div className="space-y-2 pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetStarted}
            className="w-full font-bold shadow-lg shadow-orange-500/20 text-sm sm:text-base gap-2"
          >
            <span>Explore & Get Started</span>
            <ArrowRight size={18} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="w-full text-xs text-muted hover:text-ink font-semibold"
          >
            <span>Skip for now (পরে দেখব)</span>
          </Button>
        </div>
      </div>
    </ModalFrame>
  )
}
