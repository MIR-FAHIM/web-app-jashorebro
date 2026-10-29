import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { communityApi } from '../api/communityApi'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { Flame, Users, Clock, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'

export function StartDropModal({ isOpen, onClose, product, onDropCreated }) {
  const navigate = useNavigate()
  const basePrice = Number(product?.base_price || 0)
  const minAllowedPrice = Number(product?.supplier_allocation_price || 1)
  const defaultDiscountPrice = product?.supplier_allocation_price
    ? Number(product.supplier_allocation_price)
    : Math.max(1, basePrice > 100 ? basePrice - 100 : basePrice - 10)

  const [title, setTitle] = useState(product ? `${product.title} Community Drop` : '')
  const [targetParticipants, setTargetParticipants] = useState(5)
  const [groupPrice, setGroupPrice] = useState(defaultDiscountPrice)
  const [durationHours, setDurationHours] = useState(48)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdCampaign, setCreatedCampaign] = useState(null)

  if (!product) return null

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await communityApi.drops.create({
        product_id: product.id,
        title: title.trim(),
        target_participants: Number(targetParticipants),
        group_price: Number(groupPrice),
        duration_hours: Number(durationHours),
      })
      const campaign = res.campaign || res.data || res
      setCreatedCampaign(campaign)
      if (onDropCreated) onDropCreated(campaign)
    } catch (err) {
      setError(err.message || 'Failed to start community drop.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    setCreatedCampaign(null)
    setError('')
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleModalClose}
      title={createdCampaign ? 'Community Drop Launched!' : 'Start a Community Volume Drop'}
      description={
        createdCampaign
          ? 'Your drop is now active and ready for group buyers.'
          : 'Mobilize your network to unlock special wholesale pricing together.'
      }
    >
      {createdCampaign ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
              <Flame size={28} />
            </div>
            <h4 className="mt-2 text-sm font-bold text-white">{createdCampaign.title}</h4>
            <p className="mt-1 text-xs text-slate-300">
              Target: <strong className="text-white">{createdCampaign.target_participants} buyers</strong> at{' '}
              <strong className="text-orange-400">{formatCurrency(createdCampaign.group_price)}</strong>!
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleModalClose}
              className="flex-1"
            >
              Done
            </Button>
            <Button
              type="button"
              variant="drop-fire"
              size="sm"
              onClick={() => {
                handleModalClose()
                navigate(`/drops/${createdCampaign.id}`)
              }}
              className="flex-1 gap-1.5 font-bold"
            >
              <Flame size={14} />
              <span>View Active Drop</span>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3.5 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Flame size={15} className="text-orange-400" />
              <span>Unlock volume savings for your friends & community</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When the required number of buyers join your drop, everyone gets the discounted price.
              As the community organizer, you earn organizer income on fulfilled group orders.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Campaign Title *</label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Neighborhood Weekend Deal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Users size={12} className="text-slate-400" />
                <span>Target Buyers</span>
              </label>
              <select
                value={targetParticipants}
                onChange={(e) => setTargetParticipants(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-brand focus:outline-none"
              >
                <option value={3}>3 buyers (Quick sprint)</option>
                <option value={5}>5 buyers (Recommended)</option>
                <option value={10}>10 buyers (Community goal)</option>
                <option value={20}>20 buyers (Bulk mega drop)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                <span>Duration</span>
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-brand focus:outline-none"
              >
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours (2 Days)</option>
                <option value={72}>72 Hours (3 Days)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Discounted Drop Price / Unit</label>
              <span className="text-[11px] text-slate-400">Retail: {formatCurrency(basePrice)}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
              <input
                type="number"
                min={1}
                max={basePrice}
                value={groupPrice}
                onChange={(e) => setGroupPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">
              Buyers save {formatCurrency(Math.max(0, basePrice - Number(groupPrice)))} per unit!
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="drop-fire"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="gap-1.5 font-bold"
            >
              <Flame size={14} />
              <span>{isSubmitting ? 'Launching...' : 'Launch Community Drop'}</span>
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
