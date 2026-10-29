import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/authContext'
import { communityApi } from '@/features/community/api/communityApi'
import { dropFacts } from './dropLifecycle'

export function useDropInterest(initialDrop) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [drop, setDrop] = useState(initialDrop)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const sequence = useRef(0)
  const [now, setNow] = useState(Date.now)
  const viewer = useRef(user?.id ?? null)
  const [viewerReady, setViewerReady] = useState(true)
  useEffect(() => { setDrop(initialDrop) }, [initialDrop])
  useEffect(() => {
    const request = ++sequence.current
    inFlight.current = false
    setBusy(false)
    setError('')
    const nextViewer = user?.id ?? null
    if (viewer.current !== nextViewer) {
      viewer.current = nextViewer
      setViewerReady(false)
      communityApi.drops.getDrop(initialDrop.id)
        .then((updated) => {
          if (sequence.current !== request) return
          if (!updated || Number(updated.id) !== Number(initialDrop.id) || !updated.viewer_state) throw new Error('Refresh this Drop to check your interest status.')
          setDrop(updated)
          setViewerReady(true)
        })
        .catch((failure) => { if (sequence.current === request) setError(failure.message || 'Refresh this Drop to check your interest status.') })
    }
    return () => { sequence.current += 1 }
  }, [initialDrop?.id, user?.id])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(timer)
  }, [])
  const facts = { ...dropFacts(drop, now), canExpressInterest: viewerReady && !isAuthLoading && dropFacts(drop, now).canExpressInterest }
  const toggleInterest = async (event) => {
    event?.stopPropagation?.()
    if (inFlight.current || isAuthLoading || !viewerReady) return
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location } })
      return
    }
    if (!dropFacts(drop).canExpressInterest) return
    inFlight.current = true
    const request = ++sequence.current
    setBusy(true)
    setError('')
    try {
      const updated = await communityApi.drops.toggleJoin(drop.id, !facts.interested)
      if (sequence.current !== request) return
      if (!updated || Number(updated.id) !== Number(drop.id) || !updated.viewer_state) throw new Error('The updated interest status could not be verified. Refresh this Drop before trying again.')
      setDrop(updated)
    } catch (failure) {
      if (sequence.current === request) setError(failure.message || 'Unable to update interest. Please retry.')
    } finally {
      if (sequence.current === request) {
        inFlight.current = false
        setBusy(false)
      }
    }
  }
  return { drop, facts, busy, error, toggleInterest }
}
