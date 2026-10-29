import { useState, useEffect } from 'react'
import { Dialog } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { BANGLADESH_DISTRICTS, DISTRICT_UPAZILAS } from '../data/locations'
import { addressesApi } from '@/shared/api/addressesApi'
import { useAuth } from '@/features/auth/model/authContext'
import { MapPin, Home, Building2, Tag } from 'lucide-react'

export function AddressFormModal({
  isOpen,
  onClose,
  address = null,
  onSaved,
  isInitialSetup = false,
  onDismissLater,
}) {
  const { user } = useAuth()
  const isEditing = Boolean(address?.id)

  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_phone: '',
    country: 'Bangladesh',
    district: 'Jashore',
    upazila: 'Jashore Sadar',
    street_address: '',
    landmark: '',
    postal_code: '',
    label: 'Home',
    is_default: true,
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  // Populate form with prefilled values or editing target
  useEffect(() => {
    if (isOpen) {
      if (address) {
        setFormData({
          recipient_name: address.recipient_name || '',
          recipient_phone: address.recipient_phone || '',
          country: address.country || 'Bangladesh',
          district: address.district || address.locality_district || 'Jashore',
          upazila: address.upazila || address.sub_district_thana || 'Jashore Sadar',
          street_address: address.street_address || '',
          landmark: address.landmark || '',
          postal_code: address.postal_code || '',
          label: address.label || 'Home',
          is_default: Boolean(address.is_default),
        })
      } else {
        // Prefill customer's name and phone when available
        setFormData({
          recipient_name: user?.name || '',
          recipient_phone: user?.phone || '',
          country: 'Bangladesh',
          district: 'Jashore',
          upazila: DISTRICT_UPAZILAS['Jashore']?.[0] || 'Jashore Sadar',
          street_address: '',
          landmark: '',
          postal_code: '',
          label: 'Home',
          is_default: true,
        })
      }
      setErrors({})
      setServerError('')
    }
  }, [isOpen, address, user])

  // Reset dependent upazila field when district changes
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value
    const availableUpazilas = DISTRICT_UPAZILAS[newDistrict] || []
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      upazila: availableUpazilas.length > 0 ? availableUpazilas[0] : '',
    }))
    setErrors((prev) => ({ ...prev, district: undefined, upazila: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.recipient_name.trim()) {
      errs.recipient_name = 'Recipient name is required.'
    }
    if (!formData.recipient_phone.trim()) {
      errs.recipient_phone = 'Recipient phone number is required.'
    } else if (!/^01\d{9}$/.test(formData.recipient_phone.replace(/\D/g, ''))) {
      errs.recipient_phone = 'Enter a valid 11-digit phone number (e.g. 01712345678).'
    }

    if (!formData.district.trim()) {
      errs.district = 'District is required.'
    }
    if (!formData.upazila.trim()) {
      errs.upazila = 'Upazila / Area is required.'
    }
    if (!formData.street_address.trim()) {
      errs.street_address = 'Street/house address details are required.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || isSubmitting) return

    setIsSubmitting(true)
    setServerError('')

    try {
      const payload = {
        recipient_name: formData.recipient_name.trim(),
        recipient_phone: formData.recipient_phone.trim(),
        country: formData.country.trim() || 'Bangladesh',
        district: formData.district.trim(),
        upazila: formData.upazila.trim(),
        street_address: formData.street_address.trim(),
        landmark: formData.landmark.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        label: formData.label.trim() || 'Home',
        is_default: formData.is_default,
      }

      let saved
      if (isEditing) {
        saved = await addressesApi.updateAddress(address.id, payload)
      } else {
        saved = await addressesApi.createAddress(payload)
      }

      if (onSaved) onSaved(saved)
      onClose()
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
      } else {
        setServerError(err.message || 'Failed to save address. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentUpazilaList = DISTRICT_UPAZILAS[formData.district] || []

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isInitialSetup ? 'Add your delivery address' : (isEditing ? 'Edit delivery address' : 'Add new address')}
      description={isInitialSetup ? 'Please add where you want your orders delivered.' : 'Manage your home, office, or pickup location for deliveries.'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            {serverError}
          </div>
        )}

        {/* Recipient Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Recipient Name *"
              id="recipient_name"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={(e) => {
                setFormData({ ...formData, recipient_name: e.target.value })
                setErrors({ ...errors, recipient_name: undefined })
              }}
              placeholder="e.g. Fahim Ahmed"
              error={errors.recipient_name}
              required
            />
          </div>
          <div>
            <Input
              label="Phone Number *"
              id="recipient_phone"
              name="recipient_phone"
              type="tel"
              value={formData.recipient_phone}
              onChange={(e) => {
                setFormData({ ...formData, recipient_phone: e.target.value })
                setErrors({ ...errors, recipient_phone: undefined })
              }}
              placeholder="017xxxxxxxx"
              error={errors.recipient_phone}
              required
            />
          </div>
        </div>

        {/* Location Selectors: District & Upazila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="district-select" className="text-sm font-medium text-soft">
              District *
            </label>
            <select
              id="district-select"
              value={formData.district}
              onChange={handleDistrictChange}
              className="w-full min-h-12 px-3.5 py-2.5 text-base bg-elevated border border-field-border rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            >
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.district && <span className="text-sm text-danger">{errors.district}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="upazila-select" className="text-sm font-medium text-soft">
              Upazila / Thana *
            </label>
            {currentUpazilaList.length > 0 ? (
              <select
                id="upazila-select"
                value={formData.upazila}
                onChange={(e) => {
                  setFormData({ ...formData, upazila: e.target.value })
                  setErrors({ ...errors, upazila: undefined })
                }}
                className="w-full min-h-12 px-3.5 py-2.5 text-base bg-elevated border border-field-border rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              >
                {currentUpazilaList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="upazila-input"
                name="upazila"
                value={formData.upazila}
                onChange={(e) => {
                  setFormData({ ...formData, upazila: e.target.value })
                  setErrors({ ...errors, upazila: undefined })
                }}
                placeholder="Enter upazila or thana"
                error={errors.upazila}
              />
            )}
            {errors.upazila && <span className="text-sm text-danger">{errors.upazila}</span>}
          </div>
        </div>

        {/* Detailed Street Address */}
        <div>
          <label htmlFor="street_address" className="block text-sm font-medium text-soft mb-1.5">
            Area & Street / House Address *
          </label>
          <textarea
            id="street_address"
            name="street_address"
            rows={2}
            value={formData.street_address}
            onChange={(e) => {
              setFormData({ ...formData, street_address: e.target.value })
              setErrors({ ...errors, street_address: undefined })
            }}
            placeholder="House/Holding #, Road #, Neighborhood, Area"
            className="w-full px-3.5 py-2.5 text-base bg-elevated border border-field-border rounded-xl text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            required
          />
          {errors.street_address && <span className="text-sm text-danger mt-1 block">{errors.street_address}</span>}
        </div>

        {/* Landmark & Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Nearby Landmark (Optional)"
              id="landmark"
              name="landmark"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="e.g. Beside City College"
            />
          </div>
          <div>
            <Input
              label="Postal Code (Optional)"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="e.g. 7400"
            />
          </div>
        </div>

        {/* Address Label & Default Checkbox */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-sm font-medium text-soft mb-1.5">Address Label</label>
            <div className="flex gap-2">
              {[
                { id: 'Home', icon: Home, text: 'Home' },
                { id: 'Office', icon: Building2, text: 'Office' },
                { id: 'Other', icon: Tag, text: 'Other' },
              ].map(({ id, icon: Icon, text }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormData({ ...formData, label: text })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${
                    formData.label === text
                      ? 'border-brand bg-brand/10 text-brand font-semibold'
                      : 'border-field-border text-soft hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 rounded border-field-border text-brand focus:ring-brand/30"
            />
            <span className="text-sm font-medium text-ink">Set as primary delivery address</span>
          </label>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-line">
          {isInitialSetup ? (
            <Button
              type="button"
              variant="outline"
              onClick={onDismissLater}
              className="w-full sm:w-auto text-muted"
            >
              Later
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto font-medium"
          >
            {isSubmitting ? 'Saving...' : (isInitialSetup ? 'Save & Continue' : (isEditing ? 'Update Address' : 'Save Address'))}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
