import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'jb_drop_interest_preview_v1'
const listeners = new Set()
const EMPTY_INTEREST = {}

function readInterest() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {}
    return Object.fromEntries(Object.entries(saved).filter(([, joined]) => typeof joined === 'boolean'))
  } catch {
    return {}
  }
}

let interest = readInterest()
const getSnapshot = () => interest
const getServerSnapshot = () => EMPTY_INTEREST
const notify = () => listeners.forEach((listener) => listener())

function handleStorage(event) {
  if (event.key === STORAGE_KEY || event.key === null) {
    interest = readInterest()
    notify()
  }
}

function subscribe(listener) {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', handleStorage)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('storage', handleStorage)
  }
}

export function setDropInterest(id, joined) {
  interest = { ...interest, [id]: Boolean(joined) }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(interest)) } catch { /* Keep the preview usable without storage. */ }
  notify()
}

export function useDropInterests(drops) {
  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return drops.map((drop) => {
    const isJoined = saved[drop.id] ?? drop.isJoined
    return { ...drop, isJoined, currentParticipants: drop.currentParticipants + Number(isJoined) - Number(drop.isJoined) }
  })
}

export function useDropInterest(drop) {
  const [preview] = useDropInterests([drop])
  return { ...preview, toggleJoin: () => setDropInterest(drop.id, !preview.isJoined) }
}
