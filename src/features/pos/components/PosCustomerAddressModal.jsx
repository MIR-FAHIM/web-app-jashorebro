import { useState, useEffect } from 'react'
import { Dialog } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { BANGLADESH_DISTRICTS, DISTRICT_UPAZILAS } from '@/features/addresses/data/locations'
import { posApi } from '../api/posApi'
import { Home, Building2, Tag } from 'lucide-react'

export function PosCustomerAddressModal({
  isOpen,
  onClose,
  customer,
  onSaved,
}) {
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

  useEffect(() => {
    if (isOpen && customer) {
      setFormData({
        recipient_name: customer.name || '',
        recipient_phone: customer.phone || '',
        country: 'Bangladesh',
        district: 'Jashore',
        upazila: DISTRICT_UPAZILAS['Jashore']?.[0] || 'Jashore Sadar',
        street_address: '',
        landmark: '',
        postal_code: '',
        label: 'Home',
        is_default: true,
      })
      setErrors({})
      setServerError('')
    }
  }, [isOpen, customer])

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
    if (!formData.recipient_name.trim()) errs.recipient_name = 'Recipient name is required.'
    if (!formData.recipient_phone.trim()) {
      errs.recipient_phone = 'Phone number is required.'
    } else if (!/^01\d{9}$/.test(formData.recipient_phone.replace(/\D/g, ''))) {
      errs.recipient_phone = 'Enter a valid 11-digit phone number (e.g. 01712345678).'
    }
    if (!formData.district.trim()) errs.district = 'District is required.'
    if (!formData.upazila.trim()) errs.upazila = 'Upazila / area is required.'
    if (!formData.street_address.trim()) errs.street_address = 'Street address is required.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || isSubmitting || !customer?.id) return

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

      const saved = await posApi.createCustomerAddress(customer.id, payload)
      if (onSaved) onSaved(saved)
      onClose()
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
      } else {
        setServerError(err.message || 'Failed to save address for customer.')
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
      title={`Add Address for ${customer?.name || 'Customer'}`}
      description="Create and attach a delivery address to this customer account."
      className="max-w-lg bg-slate-900 border-slate-800 text-white"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/80 p-3 text-xs text-red-300">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Recipient Name *"
              id="pos_recipient_name"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={(e) => {
                setFormData({ ...formData, recipient_name: e.target.value })
                setErrors({ ...errors, recipient_name: undefined })
              }}
              error={errors.recipient_name}
              required
            />
          </div>
          <div>
            <Input
              label="Phone Number *"
              id="pos_recipient_phone"
              name="recipient_phone"
              type="tel"
              value={formData.recipient_phone}
              onChange={(e) => {
                setFormData({ ...formData, recipient_phone: e.target.value })
                setErrors({ ...errors, recipient_phone: undefined })
              }}
              error={errors.recipient_phone}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pos-district-select" className="text-xs font-bold text-slate-300">
              District *
            </label>
            <select
              id="pos-district-select"
              value={formData.district}
              onChange={handleDistrictChange}
              className="w-full min-h-11 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand"
            >
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pos-upazila-select" className="text-xs font-bold text-slate-300">
              Upazila / Area *
            </label>
            {currentUpazilaList.length > 0 ? (
              <select
                id="pos-upazila-select"
                value={formData.upazila}
                onChange={(e) => {
                  setFormData({ ...formData, upazila: e.target.value })
                  setErrors({ ...errors, upazila: undefined })
                }}
                className="w-full min-h-11 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand"
              >
                {currentUpazilaList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.upazila}
                onChange={(e) => {
                  setFormData({ ...formData, upazila: e.target.value })
                  setErrors({ ...errors, upazila: undefined })
                }}
                className="w-full min-h-11 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand"
                placeholder="Enter upazila"
              />
            )}
            {errors.upazila && <span className="text-xs text-red-400">{errors.upazila}</span>}
          </div>
        </div>

        <div>
          <label htmlFor="pos_street_address" className="block text-xs font-bold text-slate-300 mb-1">
            Area & Street / House Address *
          </label>
          <textarea
            id="pos_street_address"
            rows={2}
            value={formData.street_address}
            onChange={(e) => {
              setFormData({ ...formData, street_address: e.target.value })
              setErrors({ ...errors, street_address: undefined })
            }}
            placeholder="House/Holding #, Road #, Neighborhood, Market area"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
            required
          />
          {errors.street_address && <span className="text-xs text-red-400 mt-1 block">{errors.street_address}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Landmark (Optional)"
            id="pos_landmark"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
            placeholder="Near City College"
          />
          <Input
            label="Postal Code (Optional)"
            id="pos_postal_code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            placeholder="7400"
          />
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Address Label</label>
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    formData.label === text
                      ? 'border-orange-500 bg-orange-500/15 text-orange-400 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500/30"
            />
            <span className="text-xs font-medium text-slate-300">Set as customer's default address</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="drop-fire" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Address...' : 'Save & Select Address'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
