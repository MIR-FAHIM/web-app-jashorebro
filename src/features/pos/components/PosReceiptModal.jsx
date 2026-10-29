import { useRef } from 'react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { Printer, Check, Plus, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PosReceiptModal({
  isOpen,
  onClose,
  order,
  onNewSale,
}) {
  const receiptRef = useRef(null)

  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const items = order.items || []
  const subtotal = order.subtotal ?? 0
  const discount = order.discount_amount ?? 0
  const shipping = order.shipping_fee ?? 0
  const total = order.total_amount ?? 0
  const amountReceived = order.amount_received ?? (order.payment_method === 'cash' ? total : null)
  const changeAmount = order.change_amount ?? (amountReceived ? Math.max(0, amountReceived - total) : null)

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="POS Sale Receipt"
      description="Transaction completed and inventory reserved."
      className="max-w-md bg-slate-900 border-slate-800 text-white"
    >
      <div className="space-y-4">
        {/* Printable Area */}
        <div
          ref={receiptRef}
          id="pos-printable-receipt"
          className="rounded-xl border border-slate-700 bg-white p-5 text-slate-900 font-mono text-xs shadow-inner"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-base font-extrabold tracking-tight uppercase">JashoreBro Market</h2>
            <p className="text-[11px] text-slate-500">Local Craft & Artisan Hub</p>
            <p className="text-[10px] text-slate-500">Mujib Sarak, Kotwali, Jashore</p>
            <p className="text-[10px] text-slate-500">Support: 01700-000000</p>
            <div className="mt-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
              {order.payment_status === 'paid' ? 'Paid In Full' : 'Payment Pending'}
            </div>
          </div>

          {/* Meta Details */}
          <div className="my-2.5 space-y-0.5 border-b border-dashed border-slate-300 pb-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Order #:</span>
              <span className="font-bold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{new Date(order.created_at || Date.now()).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{order.shipping_name || order.user?.name || 'Walk-in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span>{order.shipping_phone || order.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="truncate max-w-[200px]">{order.shipping_address}, {order.shipping_upazila}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sales Channel:</span>
              <span className="font-semibold uppercase text-orange-600">POS Storefront</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b border-dashed border-slate-300 pb-2">
            <div className="flex justify-between font-bold text-[11px] mb-1 text-slate-600">
              <span>Item / Qty</span>
              <span>Total</span>
            </div>
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between text-[11px]">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold truncate">{item.product_title || item.product?.title}</p>
                    {item.variant_name && (
                      <p className="text-[10px] text-slate-500 italic">Var: {item.variant_name}</p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="font-bold shrink-0">{formatCurrency(item.line_total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="my-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.discount_reason || 'Promo'}):</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            {shipping > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Fee:</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold border-t border-slate-800 pt-1.5 text-slate-950">
              <span>Total Payable:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="flex justify-between pt-1 text-[11px]">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold uppercase">{order.payment_method}</span>
            </div>

            {amountReceived !== null && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Cash Received:</span>
                <span>{formatCurrency(amountReceived)}</span>
              </div>
            )}

            {changeAmount !== null && (
              <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                <span>Change Returned:</span>
                <span>{formatCurrency(changeAmount)}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-3 border-t border-dashed border-slate-300 pt-2 text-center text-[10px] text-slate-400">
            <p>Thank you for supporting Jashore artisans!</p>
            <p className="mt-0.5">Keep this receipt for returns or exchange verification.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
          </Button>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/orders`}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <ExternalLink size={14} />
              <span>Orders List</span>
            </Link>

            <Button
              type="button"
              variant="drop-fire"
              size="sm"
              onClick={() => {
                onClose()
                if (onNewSale) onNewSale()
              }}
              className="flex items-center gap-1.5 font-bold"
            >
              <Plus size={15} />
              <span>New Sale</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
