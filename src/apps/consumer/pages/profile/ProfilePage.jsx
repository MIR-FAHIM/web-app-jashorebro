import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Bookmark, LogOut, MapPin, Share2, Users, PlusCircle, Loader2, AlertCircle, Pencil, ExternalLink } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { useAuth } from '@/features/auth/model/authContext'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { addressesApi } from '@/shared/api/addressesApi'
import { communityApi } from '@/features/community/api/communityApi'
import { AddressCard } from '@/features/addresses/components/AddressCard'
import { AddressFormModal } from '@/features/addresses/components/AddressFormModal'
import { EditProfileModal } from '@/features/profile/components/EditProfileModal'
import { ProfileAccountTools } from '@/features/profile/components/ProfileAccountTools'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { useLocale } from '@/shared/i18n/LocaleProvider'

export default function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, updateUser } = useAuth()
  const { t } = useLocale()
  const userId = user?.id
  const activeUserRef = useRef(userId)
  activeUserRef.current = userId
  const summaryRequest = useRef(0)
  const addressRequest = useRef(0)
  const publicHandle = params.get('person')?.replace(/^@+/, '').trim()
  const requestedTab = params.get('tab')
  const isAddressView = requestedTab === 'addresses'
  const isRedirecting = Boolean(publicHandle || requestedTab === 'picks' || ['wallet', 'earnings'].includes(requestedTab))
  const [summary, setSummary] = useState({ owner: null, data: null, loading: false, error: false })
  const [addressState, setAddressState] = useState({ owner: null, items: [], loading: false, error: false })
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressMessage, setAddressMessage] = useState('')
  const [addressError, setAddressError] = useState('')
  const [addressBusy, setAddressBusy] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [shareState, setShareState] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (publicHandle) {
      navigate(`/users/${encodeURIComponent(publicHandle)}`, { replace: true })
    } else if (requestedTab === 'picks' || ['wallet', 'earnings'].includes(requestedTab)) {
      const next = new URLSearchParams(params)
      next.delete('tab')
      next.delete('person')
      navigate({ pathname: requestedTab === 'picks' ? '/my-picks' : '/earnings', search: next.toString() ? `?${next}` : '', hash: location.hash === '#account-content' ? '' : location.hash }, { replace: true })
    }
  }, [publicHandle, requestedTab, params, location.hash, navigate])

  const loadSummary = useCallback(async () => {
    if (!userId || isAuthLoading || !isAuthenticated || isRedirecting) return
    const requestId = ++summaryRequest.current
    setSummary((previous) => ({ owner: userId, data: previous.owner === userId ? previous.data : null, loading: true, error: false }))
    try {
      const response = await communityApi.profile.getSummary()
      if (requestId !== summaryRequest.current || activeUserRef.current !== userId) return
      setSummary({ owner: userId, data: response.data || response, loading: false, error: false })
    } catch {
      if (requestId !== summaryRequest.current || activeUserRef.current !== userId) return
      setSummary((previous) => ({ ...previous, loading: false, error: true }))
    }
  }, [userId, isAuthLoading, isAuthenticated, isRedirecting])

  const loadAddresses = useCallback(async () => {
    if (!userId || isAuthLoading || !isAuthenticated || !isAddressView || isRedirecting) return
    const requestId = ++addressRequest.current
    setAddressState((previous) => ({ owner: userId, items: previous.owner === userId ? previous.items : [], loading: true, error: false }))
    try {
      const items = await addressesApi.getAddresses()
      if (requestId !== addressRequest.current || activeUserRef.current !== userId) return
      setAddressState({ owner: userId, items: Array.isArray(items) ? items : [], loading: false, error: false })
    } catch {
      if (requestId !== addressRequest.current || activeUserRef.current !== userId) return
      setAddressState((previous) => ({ ...previous, loading: false, error: true }))
    }
  }, [userId, isAuthLoading, isAuthenticated, isAddressView, isRedirecting])

  useEffect(() => { loadSummary(); return () => { summaryRequest.current += 1 } }, [loadSummary])
  useEffect(() => { loadAddresses(); return () => { addressRequest.current += 1 } }, [loadAddresses])
  useEffect(() => {
    const handleSaved = () => loadAddresses()
    window.addEventListener('jb_address_saved', handleSaved)
    return () => window.removeEventListener('jb_address_saved', handleSaved)
  }, [loadAddresses])
  useEffect(() => {
    setProfileMessage(''); setShareState(null)
    setAddressMessage(''); setAddressError(''); setIsEditModalOpen(false); setAddressModalOpen(false)
    setAddressBusy(false)
  }, [userId])
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isAddressView && location.hash === '#account-content') document.getElementById('account-content')?.scrollIntoView({ block: 'start' })
  }, [isAuthLoading, isAuthenticated, isAddressView, location.hash])

  const handleProfileUpdated = (updatedUser, { partial = false } = {}) => {
    if (activeUserRef.current !== userId) return
    summaryRequest.current += 1
    updateUser(updatedUser)
    setSummary((previous) => ({ owner: userId, loading: false, error: false, data: { ...previous.data, user: { ...previous.data?.user, ...updatedUser, ...updatedUser.profile } } }))
    setProfileMessage(partial ? '' : t('profile10.profileSaved'))
  }

  const handleAddressAction = async (address, action) => {
    if (addressBusy) return
    if (action === 'delete' && !window.confirm(t('profile10.removeAddressConfirm', { label: address.label || t('profile10.addressFallback') }))) return
    const owner = userId
    setAddressBusy(true); setAddressMessage(''); setAddressError('')
    try {
      if (action === 'delete') await addressesApi.deleteAddress(address.id)
      else await addressesApi.setDefaultAddress(address.id)
      if (activeUserRef.current !== owner) return
      setAddressMessage(t(action === 'delete' ? 'profile10.addressRemoved' : 'profile10.defaultAddressSaved'))
      loadAddresses()
    } catch {
      if (activeUserRef.current === owner) setAddressError(t('profile10.addressActionError'))
    } finally {
      if (activeUserRef.current === owner) setAddressBusy(false)
    }
  }

  const publicPath = user?.username ? `/users/${encodeURIComponent(user.username)}` : null
  const publicUrl = publicPath ? `${window.location.origin}${publicPath}` : ''
  const shareProfile = async () => {
    if (!publicUrl) return
    const owner = userId
    try { await navigator.clipboard.writeText(publicUrl); if (activeUserRef.current === owner) setShareState('copied') }
    catch { if (activeUserRef.current === owner) setShareState('manual') }
  }

  if (isAuthLoading || isRedirecting) return <p role="status" className="py-12 text-center text-sm text-muted">{t('profile10.loading')}</p>
  if (!isAuthenticated) return (
    <Card className="mx-auto max-w-md space-y-4 p-6 text-center sm:p-8">
      <Users size={28} className="mx-auto text-brand" aria-hidden="true" />
      <h1 className="text-xl font-bold text-ink">{t('profile10.signInTitle')}</h1>
      <p className="text-sm leading-relaxed text-muted">{t('profile10.signInDescription')}</p>
      <Button onClick={() => navigate('/auth', { state: { from: location } })}>{t('profile10.signIn')}</Button>
      <div className="border-t border-line pt-4 text-left"><LanguageSwitcher /></div>
    </Card>
  )

  const profile = summary.owner === userId ? summary.data?.user : null
  const name = profile?.name || user?.name || t('profile10.customer')
  const profileMedia = (keys) => {
    for (const source of [profile, user, user?.profile]) {
      for (const key of keys) {
        if (source && Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) return source[key]
      }
    }
    return null
  }
  const avatarUrl = profileMedia(['avatar_url'])
  const coverUrl = profileMedia(['cover_url', 'cover_image_url'])
  const bio = profile?.bio ?? user?.profile?.bio
  const locality = profile?.locality ?? user?.profile?.locality
  const addresses = addressState.owner === userId ? addressState.items : []
  const isAddressesLoading = addressState.owner !== userId || addressState.loading

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="overflow-hidden">
        {coverUrl && <div className="h-24 overflow-hidden"><img src={resolveImageUrl(coverUrl)} alt="" className="h-full w-full object-cover" /></div>}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Avatar name={name} src={resolveImageUrl(avatarUrl)} size="xl" className="size-16 shrink-0 border border-line bg-surface sm:size-20" />
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-xl font-bold text-ink sm:text-2xl">{name}</h1>
              {user.username && <p className="mt-1 break-all text-sm text-muted">@{user.username}</p>}
              {locality && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><MapPin size={14} className="shrink-0" aria-hidden="true" />{locality}</p>}
            </div>
          </div>
          {bio && <p className="mt-5 whitespace-pre-line break-words text-sm leading-relaxed text-soft">{bio}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="min-h-11 gap-2"><Pencil size={16} aria-hidden="true" />{t('profile10.edit')}</Button>
            {publicPath && <Link to={publicPath} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-ink hover:bg-elevated"><ExternalLink size={16} aria-hidden="true" />{t('profile10.viewPublic')}</Link>}
            {publicPath && <button type="button" onClick={shareProfile} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-ink hover:bg-elevated"><Share2 size={16} aria-hidden="true" />{t('profile10.share')}</button>}
          </div>
          {publicPath && <p className="mt-3 text-xs leading-relaxed text-muted">{t('profile10.publicOnly')}</p>}
          {shareState && <div className="mt-3 space-y-2"><p role="status" className="text-xs text-brand">{t(shareState === 'copied' ? 'profile10.linkCopied' : 'profile10.copyManually')}</p>{shareState === 'manual' && <input aria-label={t('profile10.publicLink')} readOnly value={publicUrl} onFocus={(event) => event.target.select()} className="min-h-11 w-full rounded-xl border border-line bg-elevated px-3 text-xs text-ink" />}</div>}
          {profileMessage && <p role="status" className="mt-3 rounded-xl border border-success/30 bg-success-soft p-3 text-sm text-success">{profileMessage}</p>}
          {summary.owner === userId && summary.error && <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line p-3 text-xs text-muted"><AlertCircle size={16} aria-hidden="true" /><span className="flex-1">{t('profile10.summaryError')}</span><Button size="sm" variant="outline" onClick={loadSummary}>{t('profile10.retry')}</Button></div>}
        </div>
      </Card>
      <Link to="/my-picks" className="flex min-h-20 items-center gap-4 rounded-2xl border border-brand/30 bg-brand/10 p-4 text-ink hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-5">
        <Bookmark size={25} className="shrink-0 text-brand" aria-hidden="true" />
        <div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{t('profile10.myPicks')}</h2><p className="mt-1 text-sm leading-relaxed text-muted">{t('profile10.myPicksDescription')}</p></div>
        <ArrowRight size={20} className="shrink-0 text-brand" aria-hidden="true" />
      </Link>
      <ProfileAccountTools />
      {isAddressView && <section id="account-content" aria-labelledby="profile-addresses-title" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="profile-addresses-title" className="text-lg font-semibold text-ink">{t('profile10.addresses')}</h2><Button disabled={addressBusy} onClick={() => { setEditingAddress(null); setAddressModalOpen(true) }} className="min-h-11 gap-2"><PlusCircle size={16} aria-hidden="true" />{t('profile10.addAddress')}</Button></div>
        {addressMessage && <p role="status" className="rounded-xl border border-success/30 bg-success-soft p-3 text-sm text-success">{addressMessage}</p>}
        {addressError && <p role="alert" className="rounded-xl border border-danger/30 p-3 text-sm text-danger">{addressError}</p>}
        {isAddressesLoading && <p role="status" className="flex items-center gap-2 text-sm text-muted"><Loader2 size={18} className="animate-spin" aria-hidden="true" />{t('profile10.loadingAddresses')}</p>}
        {addressState.error && <Card role="alert" className="space-y-3 p-4"><p className="text-sm text-muted">{t('profile10.addressesError')}</p><Button variant="outline" onClick={loadAddresses}>{t('profile10.retry')}</Button></Card>}
        {!isAddressesLoading && !addressState.error && addresses.length === 0 && <Card className="space-y-3 p-6 text-center"><MapPin size={25} className="mx-auto text-muted" aria-hidden="true" /><h3 className="font-semibold text-ink">{t('profile10.noAddresses')}</h3><p className="text-sm text-muted">{t('profile10.noAddressesDescription')}</p></Card>}
        {addresses.length > 0 && <div aria-busy={addressBusy || isAddressesLoading} className={`grid gap-4 sm:grid-cols-2 ${addressBusy ? 'pointer-events-none opacity-60' : ''}`}>{addresses.map((address) => <AddressCard key={address.id} address={address} onEdit={addressBusy ? undefined : () => { setEditingAddress(address); setAddressModalOpen(true) }} onDelete={addressBusy ? undefined : () => handleAddressAction(address, 'delete')} onSetDefault={addressBusy ? undefined : () => handleAddressAction(address, 'default')} />)}</div>}
      </section>}
      <div className="flex justify-end border-t border-line pt-3"><Button variant="secondary" disabled={isLoggingOut} onClick={async () => { setIsLoggingOut(true); await logout(); navigate('/login') }} className="min-h-11 gap-2"><LogOut size={16} aria-hidden="true" />{t(isLoggingOut ? 'profile10.signingOut' : 'profile10.signOut')}</Button></div>
      {isAddressView && <AddressFormModal isOpen={addressModalOpen} onClose={() => setAddressModalOpen(false)} address={editingAddress} onSaved={() => { loadAddresses(); setAddressMessage(t('profile10.addressSaved')) }} />}
      {isEditModalOpen && <EditProfileModal key={userId} isOpen onClose={() => setIsEditModalOpen(false)} currentUser={user} currentProfile={{ ...user.profile, ...profile }} onProfileUpdated={handleProfileUpdated} />}
    </div>
  )
}
