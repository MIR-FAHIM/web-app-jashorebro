import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions,
  className,
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className={cn('flex items-center justify-between gap-3 py-3 px-4', className)}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1 rounded-xl text-soft hover:text-ink hover:bg-elevated transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-ink tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
