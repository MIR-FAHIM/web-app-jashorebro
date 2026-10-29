import { useState, useRef, useEffect, useId } from 'react'
import { Camera, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { communityApi } from '@/features/community/api/communityApi'
import { authApi } from '@/features/auth/api/authApi'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { useLocale } from '@/shared/i18n/LocaleProvider'

const localities = [
  ['Jashore Sadar', 'sadar'], ['Jhikargachha', 'jhikargachha'], ['Sharsha (Benapole)', 'sharsha'],
  ['Keshabpur', 'keshabpur'], ['Manirampur', 'manirampur'], ['Abhaynagar (Noapara)', 'abhaynagar'],
  ['Bagherpara', 'bagherpara'], ['Chaugachha', 'chaugachha'], ['Jashore', 'other'],
]
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const previewUrl = (value) => value?.startsWith('blob:') ? value : resolveImageUrl(value)

export function EditProfileModal({ isOpen, onClose, currentUser, currentProfile, onProfileUpdated }) {
  const { t, formatNumber } = useLocale()
  const formId = useId()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [locality, setLocality] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [removeCover, setRemoveCover] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const avatarBlobRef = useRef(null)
  const coverBlobRef = useRef(null)
  const submittingRef = useRef(false)
  const mountedRef = useRef(true)
  const ownerRef = useRef(currentUser?.id)
  ownerRef.current = currentUser?.id

  const revokePreviews = () => {
    if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current)
    if (coverBlobRef.current) URL.revokeObjectURL(coverBlobRef.current)
    avatarBlobRef.current = null
    coverBlobRef.current = null
  }
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false; revokePreviews() }
  }, [])
  useEffect(() => {
    if (!isOpen) { revokePreviews(); return }
    setName(currentUser?.name || '')
    setBio(currentProfile?.bio ?? currentUser?.profile?.bio ?? '')
    setLocality(currentProfile?.locality ?? currentUser?.profile?.locality ?? '')
    setWebsiteUrl(currentProfile?.website_url ?? currentUser?.profile?.website_url ?? '')
    setAvatarPreview(currentProfile?.avatar_url ?? currentUser?.avatar_url ?? currentUser?.profile?.avatar_url ?? '')
    setCoverPreview(currentProfile?.cover_url ?? currentProfile?.cover_image_url ?? currentUser?.cover_url ?? currentUser?.profile?.cover_image_url ?? '')
    setAvatarFile(null); setCoverFile(null); setRemoveAvatar(false); setRemoveCover(false)
    setError(''); setFieldErrors({}); setIsSubmitting(false); submittingRef.current = false
  }, [isOpen, currentUser?.id])

  const closeModal = () => { if (!submittingRef.current) onClose() }
  const selectImage = (event, kind) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!imageTypes.has(file.type)) { setError(t('profile10.imageTypeError')); return }
    if (file.size > (kind === 'avatar' ? 5 : 10) * 1024 * 1024) { setError(t(kind === 'avatar' ? 'profile10.avatarSizeError' : 'profile10.coverSizeError')); return }
    setError('')
    const blobRef = kind === 'avatar' ? avatarBlobRef : coverBlobRef
    if (blobRef.current) URL.revokeObjectURL(blobRef.current)
    blobRef.current = URL.createObjectURL(file)
    if (kind === 'avatar') { setAvatarFile(file); setAvatarPreview(blobRef.current); setRemoveAvatar(false) }
    else { setCoverFile(file); setCoverPreview(blobRef.current); setRemoveCover(false) }
  }
  const removeImage = (kind) => {
    const blobRef = kind === 'avatar' ? avatarBlobRef : coverBlobRef
    if (blobRef.current) URL.revokeObjectURL(blobRef.current)
    blobRef.current = null
    if (kind === 'avatar') { setAvatarFile(null); setAvatarPreview(''); setRemoveAvatar(true) }
    else { setCoverFile(null); setCoverPreview(''); setRemoveCover(true) }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return
    const errors = {}
    if (!name.trim() || name.trim().length > 100) errors.name = t('profile10.nameError')
    if (bio.trim().length > 255) errors.bio = t('profile10.bioError')
    if (locality.trim().length > 100) errors.locality = t('profile10.localityError')
    if (websiteUrl.trim()) {
      try {
        const url = new URL(websiteUrl.trim())
        if (!['https:', 'http:'].includes(url.protocol) || websiteUrl.trim().length > 255) errors.website = t('profile10.websiteError')
      } catch { errors.website = t('profile10.websiteError') }
    }
    setFieldErrors(errors)
    setError('')
    if (Object.keys(errors).length) return
    const owner = currentUser?.id
    submittingRef.current = true
    setIsSubmitting(true)
    let changed = false
    let updatedUser = null
    try {
      const response = await communityApi.profile.update({
        name: name.trim(), bio: bio.trim(), locality: locality.trim(), website_url: websiteUrl.trim(),
        ...(avatarFile ? { avatar: avatarFile } : {}), ...(coverFile ? { cover: coverFile } : {}),
      })
      updatedUser = response.user || response.data?.user || response
      changed = true
      if (!mountedRef.current || ownerRef.current !== owner) return
      if (removeAvatar && !avatarFile) {
        await communityApi.profile.removeAvatar()
        updatedUser = { ...updatedUser, avatar_url: null, profile: { ...updatedUser.profile, avatar_url: null, avatar_path: null } }
      }
      if (!mountedRef.current || ownerRef.current !== owner) return
      if (removeCover && !coverFile) {
        await communityApi.profile.removeCover()
        updatedUser = { ...updatedUser, cover_url: null, profile: { ...updatedUser.profile, cover_url: null, cover_image_url: null, cover_image_path: null } }
      }
      if (!mountedRef.current || ownerRef.current !== owner) return
      onProfileUpdated?.(updatedUser)
      onClose()
    } catch {
      if (!mountedRef.current || ownerRef.current !== owner) return
      if (changed) {
        // Profile update and existing photo-removal endpoints are separate operations.
        // Refresh identity after partial success instead of claiming everything was saved.
        try { updatedUser = await authApi.getMe() } catch { /* Keep the last confirmed response. */ }
        if (!mountedRef.current || ownerRef.current !== owner) return
        if (updatedUser) onProfileUpdated?.(updatedUser, { partial: true })
        setError(t('profile10.partialSaveError'))
      } else setError(t('profile10.saveError'))
    } finally {
      submittingRef.current = false
      if (mountedRef.current && ownerRef.current === owner) setIsSubmitting(false)
    }
  }
  const inputClass = 'min-h-11 w-full rounded-xl border border-field-border bg-elevated px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

  return (
    <Dialog isOpen={isOpen} onClose={closeModal} title={t('profile10.edit')} description={t('profile10.editDescription')} closeLabel={t('profile10.closeEdit')}>
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 p-3 text-sm text-danger"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />{error}</p>}
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-5 disabled:opacity-70">
          <legend className="sr-only">{t('profile10.profileDetails')}</legend>
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="relative h-24 bg-brand/15 sm:h-28">
              {coverPreview && <img src={previewUrl(coverPreview)} alt={t('profile10.coverPreview')} className="h-full w-full object-cover" />}
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <button type="button" onClick={() => coverInputRef.current?.click()} className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface/95 px-3 text-xs font-semibold text-ink"><Camera size={16} aria-hidden="true" />{t(coverPreview ? 'profile10.changeCover' : 'profile10.addCover')}</button>
                {coverPreview && <button type="button" aria-label={t('profile10.removeCover')} onClick={() => removeImage('cover')} className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-danger"><Trash2 size={17} aria-hidden="true" /></button>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 p-3">
              <Avatar name={name || currentUser?.name || t('profile10.customer')} src={previewUrl(avatarPreview)} size="lg" className="size-16 shrink-0 border border-line" />
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-xs font-semibold text-ink"><Camera size={16} aria-hidden="true" />{t('profile10.changeAvatar')}</button>
                {avatarPreview && <button type="button" onClick={() => removeImage('avatar')} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-xs font-medium text-danger"><Trash2 size={15} aria-hidden="true" />{t('profile10.removeAvatar')}</button>}
              </div>
            </div>
            <p className="px-3 pb-3 text-xs leading-relaxed text-muted">{t('profile10.imageLimits')}</p>
            <input ref={avatarInputRef} aria-label={t('profile10.chooseAvatar')} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} onChange={(event) => selectImage(event, 'avatar')} />
            <input ref={coverInputRef} aria-label={t('profile10.chooseCover')} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} onChange={(event) => selectImage(event, 'cover')} />
          </div>
          <div>
            <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-medium text-ink">{t('profile10.fullName')}</label>
            <input id={`${formId}-name`} name="name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined} className={inputClass} />
            {fieldErrors.name && <p id={`${formId}-name-error`} role="alert" className="mt-1 text-xs text-danger">{fieldErrors.name}</p>}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2"><label htmlFor={`${formId}-bio`} className="text-sm font-medium text-ink">{t('profile10.bio')}</label><span className="text-xs text-muted">{formatNumber(bio.length)}/{formatNumber(255)}</span></div>
            <textarea id={`${formId}-bio`} rows={3} maxLength={255} value={bio} onChange={(event) => setBio(event.target.value)} placeholder={t('profile10.bioPlaceholder')} aria-invalid={Boolean(fieldErrors.bio)} aria-describedby={fieldErrors.bio ? `${formId}-bio-error` : undefined} className={`${inputClass} resize-y`} />
            {fieldErrors.bio && <p id={`${formId}-bio-error`} role="alert" className="mt-1 text-xs text-danger">{fieldErrors.bio}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-locality`} className="mb-1.5 block text-sm font-medium text-ink">{t('profile10.locality')}</label>
            <select id={`${formId}-locality`} value={locality} onChange={(event) => setLocality(event.target.value)} aria-invalid={Boolean(fieldErrors.locality)} aria-describedby={fieldErrors.locality ? `${formId}-locality-error` : undefined} className={inputClass}>
              <option value="">{t('profile10.chooseLocality')}</option>
              {locality && !localities.some(([value]) => value === locality) && <option value={locality}>{locality}</option>}
              {localities.map(([value, key]) => <option key={value} value={value}>{t(`profile10.locality.${key}`)}</option>)}
            </select>
            {fieldErrors.locality && <p id={`${formId}-locality-error`} role="alert" className="mt-1 text-xs text-danger">{fieldErrors.locality}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-website`} className="mb-1.5 block text-sm font-medium text-ink">{t('profile10.website')}</label>
            <input id={`${formId}-website`} name="url" autoComplete="url" type="url" inputMode="url" maxLength={255} value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://" aria-invalid={Boolean(fieldErrors.website)} aria-describedby={fieldErrors.website ? `${formId}-website-error` : undefined} className={inputClass} />
            {fieldErrors.website && <p id={`${formId}-website-error`} role="alert" className="mt-1 text-xs text-danger">{fieldErrors.website}</p>}
          </div>
        </fieldset>
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting} className="min-h-11">{t('profile10.cancel')}</Button>
          <Button type="submit" disabled={isSubmitting} className="min-h-11 gap-2">{isSubmitting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{t(isSubmitting ? 'profile10.saving' : 'profile10.save')}</Button>
        </div>
      </form>
    </Dialog>
  )
}
