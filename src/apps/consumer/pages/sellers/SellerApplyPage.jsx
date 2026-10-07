import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { useAuth } from '@/features/auth/model/authContext'

const JASHORE_UPAZILAS = [
  'Keshabpur',
  'Jashore Sadar',
  'Jhikargacha (গদখালি)',
  'Sharsha (শার্শা / বেনাপোল)',
  'Abhaynagar (অভয়নগর / নওয়াপাড়া)',
  'Manirampur',
  'Chaugachha',
  'Bagherpara',
]

export default function SellerApplyPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [form, setForm] = useState({
    store_name: '',
    contact_phone: user?.phone || '',
    upazila: 'Keshabpur',
    district: 'Jashore',
    address: '',
    tagline: '',
    description: '',
    trade_license_number: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/merchant/apply' } } })
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      await catalogApi.applySeller(form)
      setIsSuccess(true)
    } catch (err) {
      setErrorMessage(err.message || 'Application failed. Please verify your details.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center space-y-4 my-10 border-emerald-200 bg-emerald-50/30">
        <div className="size-16 mx-auto rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Submitted!</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          Thank you for applying to become a verified JashoreBro Producer. Our community verification team in Jashore will review your details and reach out within 24 hours.
        </p>
        <div className="pt-4">
          <Button variant="drop-fire" onClick={() => navigate('/merchants')}>
            Browse Producer Community
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex size-14 rounded-2xl bg-orange-100 text-brand items-center justify-center mb-1">
          <Store size={28} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Become a JashoreBro Producer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Directly reach local and national buyers who value pure Jashore date palm gur, Nakshi kantha, flowers, and artisan craft.
        </p>
      </div>

      <Card className="p-6 sm:p-8 shadow-sm border-slate-200">
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Store / Business Name"
            placeholder="e.g. Keshabpur Heritage Gur"
            value={form.store_name}
            onChange={(e) => setForm({ ...form, store_name: e.target.value })}
            required
          />

          <Input
            label="Contact Mobile Number"
            type="tel"
            placeholder="017XXXXXXXX"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Upazila / Region in Jashore
            </label>
            <select
              value={form.upazila}
              onChange={(e) => setForm({ ...form, upazila: e.target.value })}
              className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            >
              {JASHORE_UPAZILAS.map((up) => (
                <option key={up} value={up.split(' ')[0]}>
                  {up}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Full Physical Address / Village"
            placeholder="e.g. Trimohini Road, Keshabpur"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <Input
            label="Tagline (Short Summary)"
            placeholder="e.g. 100% Pure Date Palm Jaggery without chemical whiteners"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              About Your Craft & Products
            </label>
            <textarea
              rows={3}
              placeholder="Tell our community what makes your harvest or product unique..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-surface border border-line rounded-xl p-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            />
          </div>

          <Input
            label="Trade License / Registration Number (Optional)"
            placeholder="If available"
            value={form.trade_license_number}
            onChange={(e) => setForm({ ...form, trade_license_number: e.target.value })}
          />

          <Button
            type="submit"
            variant="drop-fire"
            size="lg"
            className="w-full mt-4 gap-2"
            isLoading={isLoading}
          >
            <span>Submit Application</span>
            <ArrowRight size={16} />
          </Button>

          <p className="text-[11px] text-center text-slate-400 pt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Community verified. Zero hidden setup fees.</span>
          </p>
        </form>
      </Card>
    </div>
  )
}
