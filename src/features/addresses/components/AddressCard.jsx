import { Home, Building2, Tag, Check, Trash2, Edit2, MapPin } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect,
}) {
  const getIcon = (label) => {
    switch (label?.toLowerCase()) {
      case 'office':
        return <Building2 size={16} className="text-brand" />
      case 'home':
        return <Home size={16} className="text-brand" />
      default:
        return <Tag size={16} className="text-brand" />
    }
  }

  const isDefault = Boolean(address.is_default)

  return (
    <Card
      className={`relative p-4 transition-all duration-150 ${
        selectable
          ? selected
            ? 'border-brand bg-brand/5 ring-1 ring-brand'
            : 'border-line hover:border-slate-300 cursor-pointer'
          : 'border-line'
      }`}
      onClick={selectable && onSelect ? () => onSelect(address) : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-medium text-ink text-sm">
            {getIcon(address.label)}
            <span>{address.label || 'Home'}</span>
          </span>

          {isDefault && (
            <Badge variant="success" className="text-xs px-2 py-0.5">
              Default
            </Badge>
          )}
        </div>

        {selectable && (
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
              selected ? 'border-brand bg-brand text-on-brand' : 'border-field-border bg-canvas'
            }`}
          >
            {selected && <Check size={12} strokeWidth={3} />}
          </div>
        )}
      </div>

      <div className="mt-2.5 space-y-1">
        <p className="font-semibold text-ink text-sm">
          {address.recipient_name}{' '}
          <span className="font-normal font-mono text-muted text-xs">({address.recipient_phone})</span>
        </p>

        <p className="text-sm text-soft leading-relaxed">
          {address.street_address}
        </p>

        <p className="text-xs text-muted flex items-center gap-1">
          <MapPin size={12} className="shrink-0 text-slate-400" />
          <span>
            {address.upazila || address.sub_district_thana}, {address.district || address.locality_district}
            {address.postal_code ? ` - ${address.postal_code}` : ''}, {address.country || 'Bangladesh'}
          </span>
        </p>

        {address.landmark && (
          <p className="text-xs text-muted italic">
            Landmark: {address.landmark}
          </p>
        )}
      </div>

      {!selectable && (
        <div className="mt-3.5 flex items-center justify-between border-t border-line pt-2.5 text-xs">
          <div>
            {!isDefault && onSetDefault && (
              <button
                type="button"
                onClick={() => onSetDefault(address)}
                className="font-medium text-brand hover:underline"
              >
                Set as Default
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(address)}
                className="flex items-center gap-1 text-soft hover:text-ink font-medium"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(address)}
                className="flex items-center gap-1 text-danger/80 hover:text-danger font-medium"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
