import { useState, useEffect } from 'react'
import {
  X,
  Upload,
  Trash2,
  Star,
  Plus,
  Flame,
  Check,
  AlertCircle,
  Layers,
  Sparkles,
  ShoppingBag,
  Truck,
  DollarSign,
  Tag,
} from 'lucide-react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { adminCatalogApi } from '../../api/adminCatalogApi'

export function ProductFormModal({ isOpen, onClose, productToEdit, onSaved }) {
  const isEditing = Boolean(productToEdit?.id)
  const [activeTab, setActiveTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Category and attribute definitions
  const [categories, setCategories] = useState([])
  const [availableAttributes, setAvailableAttributes] = useState([])

  // Images state
  const [existingImages, setExistingImages] = useState([])
  const [pendingFiles, setPendingFiles] = useState([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category_id: '',
    brand: '',
    short_description: '',
    description: '',
    sku: '',
    barcode: '',
    status: 'draft',
    visibility: 'public',
    currency: 'BDT',
    base_price: '',
    compare_price: '',
    cost_price: '',
    stock_quantity: '0',
    track_inventory: true,
    low_stock_threshold: '5',
    min_order_quantity: '1',
    max_order_quantity: '10',
    is_normal_purchase_enabled: true,
    is_group_buy_enabled: false,
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: false,
    is_cod_available: true,
    is_free_shipping: false,
    shipping_charge: '60',
    is_returnable: true,
    return_window_days: '7',
    is_cancelable: true,
    cancellation_cutoff_hours: '24',
    weight_kg: '',
    tags: '',
  })

  // Specifications state: [{ attribute_id, attribute_item_id, custom_value }]
  const [specifications, setSpecifications] = useState([])

  // Variants state: [{ id, name, sku, price_override, compare_price, group_price, stock_quantity, attribute_item_ids, is_active }]
  const [variants, setVariants] = useState([])

  // Variant generator selections: { [attribute_id]: [item_id_1, item_id_2] }
  const [selectedVariantOptionIds, setSelectedVariantOptionIds] = useState({})

  // Load lookup data
  useEffect(() => {
    if (isOpen) {
      adminCatalogApi.getCategoriesLookup().then(setCategories).catch(() => {})
      adminCatalogApi.getAttributes().then(setAvailableAttributes).catch(() => {})
    }
  }, [isOpen])

  // Populate form if editing
  useEffect(() => {
    if (productToEdit && isOpen) {
      setForm({
        title: productToEdit.title || '',
        slug: productToEdit.slug || '',
        category_id: productToEdit.category_id || productToEdit.category?.id || '',
        brand: productToEdit.brand || '',
        short_description: productToEdit.short_description || '',
        description: productToEdit.description || '',
        sku: productToEdit.sku || '',
        barcode: productToEdit.barcode || '',
        status: productToEdit.status || 'draft',
        visibility: productToEdit.visibility || 'public',
        currency: productToEdit.currency || 'BDT',
        base_price: productToEdit.base_price !== undefined ? String(productToEdit.base_price) : '',
        compare_price: productToEdit.compare_price !== undefined ? String(productToEdit.compare_price) : '',
        cost_price: productToEdit.cost_price !== undefined ? String(productToEdit.cost_price) : '',
        stock_quantity: productToEdit.stock_quantity !== undefined ? String(productToEdit.stock_quantity) : '0',
        track_inventory: productToEdit.track_inventory ?? true,
        low_stock_threshold: productToEdit.low_stock_threshold !== undefined ? String(productToEdit.low_stock_threshold) : '5',
        min_order_quantity: productToEdit.min_order_quantity !== undefined ? String(productToEdit.min_order_quantity) : '1',
        max_order_quantity: productToEdit.max_order_quantity !== undefined ? String(productToEdit.max_order_quantity) : '10',
        is_normal_purchase_enabled: productToEdit.is_normal_purchase_enabled ?? true,
        is_group_buy_enabled: productToEdit.is_group_buy_enabled ?? false,
        is_featured: productToEdit.is_featured ?? false,
        is_new_arrival: productToEdit.is_new_arrival ?? false,
        is_bestseller: productToEdit.is_bestseller ?? false,
        is_cod_available: productToEdit.is_cod_available ?? true,
        is_free_shipping: productToEdit.is_free_shipping ?? false,
        shipping_charge: productToEdit.shipping_charge !== undefined ? String(productToEdit.shipping_charge) : '60',
        is_returnable: productToEdit.is_returnable ?? true,
        return_window_days: productToEdit.return_window_days !== undefined ? String(productToEdit.return_window_days) : '7',
        is_cancelable: productToEdit.is_cancelable ?? true,
        cancellation_cutoff_hours: productToEdit.cancellation_cutoff_hours !== undefined ? String(productToEdit.cancellation_cutoff_hours) : '24',
        weight_kg: productToEdit.weight_kg !== undefined ? String(productToEdit.weight_kg) : '',
        tags: Array.isArray(productToEdit.tags) ? productToEdit.tags.join(', ') : '',
      })

      setExistingImages(productToEdit.images || [])

      if (productToEdit.specifications) {
        setSpecifications(
          productToEdit.specifications.map((s) => ({
            attribute_id: s.attribute_id,
            attribute_item_id: s.attribute_item_id,
            custom_value: s.custom_value,
          }))
        )
      } else {
        setSpecifications([])
      }

      if (productToEdit.variants) {
        setVariants(
          productToEdit.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku || '',
            barcode: v.barcode || '',
            price_override: v.price_override !== null ? v.price_override : '',
            compare_price: v.compare_price !== null ? v.compare_price : '',
            group_price: v.group_price !== null ? v.group_price : '',
            stock_quantity: v.stock_quantity ?? 0,
            attribute_item_ids: v.attribute_items?.map((ai) => ai.id) || [],
            is_active: v.is_active ?? true,
          }))
        )
      } else {
        setVariants([])
      }
    } else if (isOpen) {
      // Reset form
      setForm({
        title: '',
        slug: '',
        category_id: '',
        brand: '',
        short_description: '',
        description: '',
        sku: '',
        barcode: '',
        status: 'draft',
        visibility: 'public',
        currency: 'BDT',
        base_price: '',
        compare_price: '',
        cost_price: '',
        stock_quantity: '0',
        track_inventory: true,
        low_stock_threshold: '5',
        min_order_quantity: '1',
        max_order_quantity: '10',
        is_normal_purchase_enabled: true,
        is_group_buy_enabled: false,
        is_featured: false,
        is_new_arrival: false,
        is_bestseller: false,
        is_cod_available: true,
        is_free_shipping: false,
        shipping_charge: '60',
        is_returnable: true,
        return_window_days: '7',
        is_cancelable: true,
        cancellation_cutoff_hours: '24',
        weight_kg: '',
        tags: '',
      })
      setExistingImages([])
      setPendingFiles([])
      setSpecifications([])
      setVariants([])
      setSelectedVariantOptionIds({})
    }
    setActiveTab('general')
    setErrorMessage('')
    setFieldErrors({})
  }, [productToEdit, isOpen])

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Generate Cartesian combinations for variants
  const handleGenerateVariants = () => {
    const selectedAttributes = availableAttributes.filter(
      (attr) => attr.is_variant && selectedVariantOptionIds[attr.id]?.length > 0
    )

    if (selectedAttributes.length === 0) {
      alert('Please select at least one attribute item to generate combinations.')
      return
    }

    const arraysToCombine = selectedAttributes.map((attr) => {
      const selectedItemIds = selectedVariantOptionIds[attr.id]
      return attr.items.filter((item) => selectedItemIds.includes(item.id))
    })

    const cartesian = (arrays) => {
      return arrays.reduce(
        (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
        [[]]
      )
    }

    const combinations = cartesian(arraysToCombine)

    const newVariants = combinations.map((combo) => {
      const name = combo.map((c) => c.label).join(' / ')
      const itemIds = combo.map((c) => c.id)

      // Try matching existing variant
      const existing = variants.find((v) => {
        const sortedV = [...v.attribute_item_ids].sort()
        const sortedCombo = [...itemIds].sort()
        return JSON.stringify(sortedV) === JSON.stringify(sortedCombo)
      })

      return {
        id: existing?.id,
        name,
        sku: existing?.sku || `${form.sku || 'SKU'}-${combo.map((c) => c.value).join('-')}`.toUpperCase(),
        price_override: existing?.price_override ?? '',
        compare_price: existing?.compare_price ?? '',
        group_price: existing?.group_price ?? '',
        stock_quantity: existing?.stock_quantity ?? 10,
        attribute_item_ids: itemIds,
        is_active: existing?.is_active ?? true,
      }
    })

    setVariants(newVariants)
  }

  // File uploads
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setPendingFiles((prev) => [...prev, ...files])
  }

  const handleRemovePendingFile = (idx) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleDeleteExistingImage = async (imgId) => {
    if (!productToEdit?.id) return
    try {
      await adminCatalogApi.deleteImage(productToEdit.id, imgId)
      setExistingImages((prev) => prev.filter((img) => img.id !== imgId))
    } catch (err) {
      alert(err.message || 'Failed to remove image.')
    }
  }

  const handleSetPrimaryImage = async (imgId) => {
    if (!productToEdit?.id) return
    const updated = existingImages.map((img) => ({
      id: img.id,
      sort_order: img.sort_order,
      alt_text: img.alt_text,
      is_primary: img.id === imgId,
    }))
    try {
      await adminCatalogApi.updateImages(productToEdit.id, updated)
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imgId }))
      )
    } catch (err) {
      alert(err.message || 'Failed to set primary image.')
    }
  }

  // Save product
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setFieldErrors({})

    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        category_id: form.category_id ? Number(form.category_id) : null,
        brand: form.brand || null,
        short_description: form.short_description || null,
        description: form.description || null,
        sku: form.sku || null,
        barcode: form.barcode || null,
        status: form.status,
        visibility: form.visibility,
        currency: form.currency || 'BDT',
        base_price: form.base_price !== '' ? Number(form.base_price) : null,
        compare_price: form.compare_price !== '' ? Number(form.compare_price) : null,
        cost_price: form.cost_price !== '' ? Number(form.cost_price) : null,
        stock_quantity: Number(form.stock_quantity) || 0,
        track_inventory: form.track_inventory,
        low_stock_threshold: Number(form.low_stock_threshold) || 5,
        min_order_quantity: Number(form.min_order_quantity) || 1,
        max_order_quantity: form.max_order_quantity !== '' ? Number(form.max_order_quantity) : null,
        is_normal_purchase_enabled: form.is_normal_purchase_enabled,
        is_group_buy_enabled: form.is_group_buy_enabled,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_bestseller: form.is_bestseller,
        is_cod_available: form.is_cod_available,
        is_free_shipping: form.is_free_shipping,
        shipping_charge: Number(form.shipping_charge) || 0,
        is_returnable: form.is_returnable,
        return_window_days: Number(form.return_window_days) || 7,
        is_cancelable: form.is_cancelable,
        cancellation_cutoff_hours: Number(form.cancellation_cutoff_hours) || 24,
        weight_kg: form.weight_kg !== '' ? Number(form.weight_kg) : null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        specification_attributes: specifications,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || null,
          barcode: v.barcode || null,
          price_override: v.price_override !== '' ? Number(v.price_override) : null,
          compare_price: v.compare_price !== '' ? Number(v.compare_price) : null,
          group_price: v.group_price !== '' ? Number(v.group_price) : null,
          stock_quantity: Number(v.stock_quantity) || 0,
          attribute_item_ids: v.attribute_item_ids,
          is_active: v.is_active,
        })),
      }

      let saved
      if (isEditing) {
        saved = await adminCatalogApi.updateProduct(productToEdit.id, payload)
      } else {
        saved = await adminCatalogApi.createProduct(payload)
      }

      // Upload pending files if any
      if (pendingFiles.length > 0 && saved?.id) {
        const formData = new FormData()
        pendingFiles.forEach((file) => formData.append('images[]', file))
        await adminCatalogApi.uploadImages(saved.id, formData)
      }

      onSaved()
      onClose()
    } catch (err) {
      setErrorMessage(err.message || 'Validation failed. Please verify required fields.')
      if (err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Product: ${productToEdit?.title}` : 'Create New Marketplace Product'}
      description="Configure general information, inventory, behavioral flags, media, and variants."
      className="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-xs">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'general', label: '1. General Info', icon: ShoppingBag },
            { id: 'pricing', label: '2. Pricing & Flags', icon: DollarSign },
            { id: 'media', label: '3. Media & Photos', icon: Upload },
            { id: 'variants', label: '4. Variants & Specs', icon: Layers },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                activeTab === id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authentic Keshabpur Date Palm Jaggery"
                  value={form.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
                />
                {fieldErrors.title && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.title[0]}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Custom Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="auto-generated-from-title"
                  value={form.slug}
                  onChange={(e) => handleFieldChange('slug', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 font-mono text-xs focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => handleFieldChange('category_id', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Brand / Maker</label>
                <input
                  type="text"
                  placeholder="e.g. Jashore Heritage"
                  value={form.brand}
                  onChange={(e) => handleFieldChange('brand', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Master SKU Code</label>
                <input
                  type="text"
                  placeholder="JB-GUR-01"
                  value={form.sku}
                  onChange={(e) => handleFieldChange('sku', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Publishing Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none font-semibold"
                >
                  <option value="draft">Draft (Private / Incomplete permitted)</option>
                  <option value="published">Published (Live in catalog)</option>
                  <option value="archived">Archived (Hidden from catalog)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Visibility</label>
                <select
                  value={form.visibility}
                  onChange={(e) => handleFieldChange('visibility', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="public">Public (Visible in feeds & search)</option>
                  <option value="hidden">Hidden (Accessible only by direct link)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Short Summary</label>
              <input
                type="text"
                placeholder="1-2 sentences highlighting craftsmanship..."
                value={form.short_description}
                onChange={(e) => handleFieldChange('short_description', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Description</label>
              <textarea
                rows={4}
                placeholder="Detailed story, artisan background, usage guidelines..."
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="gur, date palm, organic, winter"
                value={form.tags}
                onChange={(e) => handleFieldChange('tags', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Pricing & Flags */}
        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">
                Pricing & Valuation (BDT)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Base Retail Price (BDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="650.00"
                    value={form.base_price}
                    onChange={(e) => handleFieldChange('base_price', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                  />
                  {fieldErrors.base_price && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.base_price[0]}</p>}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Compare-at Price (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="780.00"
                    value={form.compare_price}
                    onChange={(e) => handleFieldChange('compare_price', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Internal Cost Price (Admin Only)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="480.00"
                    value={form.cost_price}
                    onChange={(e) => handleFieldChange('cost_price', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Kept strictly out of customer responses</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">
                Inventory & Limits
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) => handleFieldChange('stock_quantity', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Low-Stock Alert</label>
                  <input
                    type="number"
                    value={form.low_stock_threshold}
                    onChange={(e) => handleFieldChange('low_stock_threshold', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min Order Qty</label>
                  <input
                    type="number"
                    value={form.min_order_quantity}
                    onChange={(e) => handleFieldChange('min_order_quantity', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Order Qty</label>
                  <input
                    type="number"
                    value={form.max_order_quantity}
                    onChange={(e) => handleFieldChange('max_order_quantity', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Behavioral Flags Toggles */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">
                Purchase Modes & Platform Flags
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_normal_purchase_enabled}
                    onChange={(e) => handleFieldChange('is_normal_purchase_enabled', e.target.checked)}
                    className="accent-orange-500 size-4"
                  />
                  <div>
                    <span className="font-bold text-white block">Direct Buying</span>
                    <span className="text-[10px] text-slate-400">Normal "Add to Cart"</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_group_buy_enabled}
                    onChange={(e) => handleFieldChange('is_group_buy_enabled', e.target.checked)}
                    className="accent-orange-500 size-4"
                  />
                  <div>
                    <span className="font-bold text-white block">Group Buy Eligible</span>
                    <span className="text-[10px] text-slate-400">Permits Volume Drops</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_cod_available}
                    onChange={(e) => handleFieldChange('is_cod_available', e.target.checked)}
                    className="accent-orange-500 size-4"
                  />
                  <div>
                    <span className="font-bold text-white block">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-400">COD enabled</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_free_shipping}
                    onChange={(e) => handleFieldChange('is_free_shipping', e.target.checked)}
                    className="accent-orange-500 size-4"
                  />
                  <div>
                    <span className="font-bold text-white block">Free Shipping</span>
                    <span className="text-[10px] text-slate-400">0 BDT Delivery Fee</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => handleFieldChange('is_featured', e.target.checked)}
                    className="accent-orange-500 size-4"
                  />
                  <div>
                    <span className="font-bold text-white block">Featured Item</span>
                    <span className="text-[10px] text-slate-400">Frontpage spotlight</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_new_arrival}
                    onChange={(e) => handleFieldChange('is_new_arrival', e.target.checked)}
                    className="accent-orange-500 size-4"
                  />
                  <div>
                    <span className="font-bold text-white block">New Arrival</span>
                    <span className="text-[10px] text-slate-400">Mark as fresh find</span>
                  </div>
                </label>
              </div>

              {!form.is_free_shipping && (
                <div className="pt-2 max-w-xs">
                  <label className="block text-slate-300 font-bold mb-1">Standard Delivery Fee (BDT)</label>
                  <input
                    type="number"
                    value={form.shipping_charge}
                    onChange={(e) => handleFieldChange('shipping_charge', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Media & Photos */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs">Product Imagery Gallery</p>
                  <p className="text-[11px] text-slate-400">
                    Upload multiple clear photos. Click the star to set the primary catalog cover image.
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold cursor-pointer transition-colors">
                  <Upload size={14} />
                  <span>Choose Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400">Existing Uploaded Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {existingImages.map((img) => (
                      <div
                        key={img.id}
                        className={`relative group rounded-xl overflow-hidden border bg-slate-950 aspect-square ${
                          img.is_primary ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-slate-800'
                        }`}
                      >
                        <img src={img.image_url} alt="" className="size-full object-cover" />
                        {img.is_primary && (
                          <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white p-1 rounded-md shadow-xs">
                            <Star size={11} className="fill-white" />
                          </span>
                        )}
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(img.id)}
                              title="Set as Primary Image"
                              className="size-7 rounded-lg bg-orange-500/80 hover:bg-orange-500 text-white flex items-center justify-center"
                            >
                              <Star size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingImage(img.id)}
                            title="Delete Image"
                            className="size-7 rounded-lg bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Upload Files */}
              {pendingFiles.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-bold text-orange-400">Pending Images (Will upload upon saving):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {pendingFiles.map((file, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square">
                        <img src={URL.createObjectURL(file)} alt="" className="size-full object-cover opacity-80" />
                        <button
                          type="button"
                          onClick={() => handleRemovePendingFile(idx)}
                          className="absolute top-1 right-1 size-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Variants & Specifications */}
        {activeTab === 'variants' && (
          <div className="space-y-5">
            {/* Variant Generator */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">
                    Combinatorial Variant Generator
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Select options below (e.g. Color × Size) to generate SKU combinations with price and stock overrides.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="drop-fire"
                  size="xs"
                  onClick={handleGenerateVariants}
                  className="font-bold"
                >
                  Generate Combinations
                </Button>
              </div>

              {/* Attribute check boxes */}
              <div className="space-y-3 pt-2">
                {availableAttributes
                  .filter((a) => a.is_variant)
                  .map((attr) => (
                    <div key={attr.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="font-bold text-white text-[11px]">{attr.name}:</span>
                      <div className="flex flex-wrap gap-2">
                        {attr.items?.map((item) => {
                          const current = selectedVariantOptionIds[attr.id] || []
                          const isChecked = current.includes(item.id)
                          return (
                            <label
                              key={item.id}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer text-[11px] transition-colors ${
                                isChecked
                                  ? 'border-orange-500 bg-orange-500/15 text-orange-400 font-bold'
                                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...current, item.id]
                                    : current.filter((id) => id !== item.id)
                                  setSelectedVariantOptionIds({
                                    ...selectedVariantOptionIds,
                                    [attr.id]: updated,
                                  })
                                }}
                                className="hidden"
                              />
                              {item.color_code && (
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color_code }} />
                              )}
                              <span>{item.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Generated Variants Table */}
            {variants.length > 0 && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white text-xs">Generated Purchasable Options ({variants.length})</p>
                  <span className="text-[11px] text-slate-500">
                    Stock aggregate auto-calculated server-side
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Variant Name</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Price Override</th>
                        <th className="p-2">Group Price</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {variants.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="p-2 font-bold text-white max-w-[150px] truncate">{v.name}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const val = e.target.value
                                setVariants((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                                )
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-white text-[11px] font-mono w-28"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder={form.base_price || 'Base'}
                              value={v.price_override}
                              onChange={(e) => {
                                const val = e.target.value
                                setVariants((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, price_override: val } : item))
                                )
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-white text-[11px] w-20"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="Group BDT"
                              value={v.group_price}
                              onChange={(e) => {
                                const val = e.target.value
                                setVariants((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, group_price: val } : item))
                                )
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-orange-400 text-[11px] w-20"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={v.stock_quantity}
                              onChange={(e) => {
                                const val = e.target.value
                                setVariants((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, stock_quantity: val } : item))
                                )
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-white text-[11px] w-16"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="drop-fire" size="sm" className="font-bold gap-1.5" isLoading={isSubmitting}>
            <Check size={16} />
            <span>{isEditing ? 'Save Changes' : 'Create Marketplace Product'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
