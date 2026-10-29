import { useState, useEffect } from 'react'
import {
  FolderTree,
  AlertCircle,
  ShoppingBag,
  Smartphone,
  Laptop,
  Shirt,
  Sparkles,
  Utensils,
  BookOpen,
  Heart,
  Home,
  Package,
  Tag,
  Gift,
  Compass,
  Coffee,
  Baby,
  Palette,
  Layers,
  Tv,
  Watch,
  Flame,
  Award,
  Truck,
  Scissors,
  Flower2,
  Dumbbell,
  Shield,
  Check,
} from 'lucide-react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { adminCatalogApi } from '../../api/adminCatalogApi'

const POPULAR_ICONS = [
  { name: 'FolderTree', icon: FolderTree },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Laptop', icon: Laptop },
  { name: 'Shirt', icon: Shirt },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Utensils', icon: Utensils },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Heart', icon: Heart },
  { name: 'Home', icon: Home },
  { name: 'Package', icon: Package },
  { name: 'Tag', icon: Tag },
  { name: 'Gift', icon: Gift },
  { name: 'Compass', icon: Compass },
  { name: 'Coffee', icon: Coffee },
  { name: 'Baby', icon: Baby },
  { name: 'Palette', icon: Palette },
  { name: 'Layers', icon: Layers },
  { name: 'Tv', icon: Tv },
  { name: 'Watch', icon: Watch },
  { name: 'Flame', icon: Flame },
  { name: 'Award', icon: Award },
  { name: 'Truck', icon: Truck },
  { name: 'Scissors', icon: Scissors },
  { name: 'Flower2', icon: Flower2 },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Shield', icon: Shield },
]

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')

export function CategoryFormModal({
  isOpen,
  onClose,
  categoryToEdit = null,
  initialParentId = null,
  parentCategories = [],
  onSaved,
}) {
  const isEditing = Boolean(categoryToEdit)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    parent_id: '',
    icon: 'FolderTree',
    image_url: '',
    description: '',
    order_index: '0',
    is_active: true,
  })

  const [isAutoSlug, setIsAutoSlug] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setForm({
          name: categoryToEdit.name || '',
          slug: categoryToEdit.slug || '',
          parent_id: categoryToEdit.parent_id ? String(categoryToEdit.parent_id) : '',
          icon: categoryToEdit.icon || 'FolderTree',
          image_url: categoryToEdit.image_url || '',
          description: categoryToEdit.description || '',
          order_index: categoryToEdit.order_index !== undefined ? String(categoryToEdit.order_index) : '0',
          is_active: categoryToEdit.is_active ?? true,
        })
        setIsAutoSlug(false)
      } else {
        setForm({
          name: '',
          slug: '',
          parent_id: initialParentId ? String(initialParentId) : '',
          icon: 'FolderTree',
          image_url: '',
          description: '',
          order_index: '0',
          is_active: true,
        })
        setIsAutoSlug(true)
      }
      setErrorMessage('')
      setFieldErrors({})
    }
  }, [isOpen, categoryToEdit, initialParentId])

  const handleNameChange = (e) => {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: isAutoSlug ? slugify(val) : prev.slug,
    }))
  }

  const handleSlugChange = (e) => {
    setIsAutoSlug(false)
    setForm((prev) => ({
      ...prev,
      slug: slugify(e.target.value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setErrorMessage('Category name is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setFieldErrors({})

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name.trim()),
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      icon: form.icon ? form.icon.trim() : null,
      image_url: form.image_url ? form.image_url.trim() : null,
      description: form.description ? form.description.trim() : null,
      order_index: Number(form.order_index) || 0,
      is_active: Boolean(form.is_active),
    }

    try {
      if (isEditing) {
        await adminCatalogApi.updateCategory(categoryToEdit.id, payload)
      } else {
        await adminCatalogApi.createCategory(payload)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save category. Please check your inputs.')
      if (err.errors) {
        setFieldErrors(err.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find icon component for preview
  const SelectedIconComp =
    POPULAR_ICONS.find((item) => item.name.toLowerCase() === (form.icon || '').toLowerCase())?.icon || FolderTree

  // Filter parents to exclude current category when editing
  const eligibleParents = parentCategories.filter(
    (p) => !categoryToEdit || p.id !== categoryToEdit.id
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Category: ${categoryToEdit?.name}` : 'Create New Category'}
      description="Define category properties, parent hierarchy, navigation icon, and display order."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-xs">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hierarchy Selector */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="block text-slate-200 font-bold text-xs">
            Parent Category Hierarchy
          </label>
          <select
            value={form.parent_id}
            onChange={(e) => setForm((prev) => ({ ...prev, parent_id: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="">📁 Top-Level (Root Category)</option>
            {eligibleParents.map((p) => (
              <option key={p.id} value={p.id}>
                ↳ Subcategory of: {p.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            {form.parent_id
              ? 'This category will appear nested under the selected parent.'
              : 'This category will act as a primary root department in catalog navigation.'}
          </p>
          {fieldErrors.parent_id && (
            <p className="text-red-400 text-[11px] mt-1">{fieldErrors.parent_id[0]}</p>
          )}
        </div>

        {/* Name and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Category Name <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Traditional Nakshi Kantha"
              value={form.name}
              onChange={handleNameChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
            />
            {fieldErrors.name && (
              <p className="text-red-400 text-[11px] mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-bold">URL Slug</label>
              {!isAutoSlug && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoSlug(true)
                    setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
                  }}
                  className="text-[10px] text-orange-400 hover:underline"
                >
                  Auto-generate
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="traditional-nakshi-kantha"
              value={form.slug}
              onChange={handleSlugChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 font-mono text-xs focus:border-orange-500 focus:outline-none"
            />
            {fieldErrors.slug && (
              <p className="text-red-400 text-[11px] mt-1">{fieldErrors.slug[0]}</p>
            )}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-slate-300 font-bold mb-1.5">
            Category Icon
          </label>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
              <SelectedIconComp size={20} />
            </div>
            <input
              type="text"
              placeholder="Icon name (e.g. ShoppingBag, Smartphone, or emoji)"
              value={form.icon}
              onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 font-mono text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/50 rounded-xl border border-slate-800">
            {POPULAR_ICONS.map(({ name, icon: IconComp }) => {
              const isSelected = form.icon?.toLowerCase() === name.toLowerCase()
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, icon: name }))}
                  title={name}
                  className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <IconComp size={16} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Image URL & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-300 font-bold mb-1">
              Banner / Thumbnail Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://... or /storage/categories/..."
              value={form.image_url}
              onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Display Sort Order
            </label>
            <input
              type="number"
              min="0"
              value={form.order_index}
              onChange={(e) => setForm((prev) => ({ ...prev, order_index: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Image preview thumbnail if url is provided */}
        {form.image_url && (
          <div className="flex items-center gap-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <img
              src={form.image_url}
              alt="Preview"
              className="size-12 rounded-lg object-cover bg-slate-900 border border-slate-700"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <span className="text-[11px] text-slate-400 truncate">{form.image_url}</span>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-slate-300 font-bold mb-1">
            Description (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Brief merchandising description of what belongs in this category..."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none resize-none"
          />
        </div>

        {/* Active Status Switch */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
          <div>
            <p className="font-bold text-slate-200">Active Status</p>
            <p className="text-[11px] text-slate-400">
              When disabled, category and its subcategories will be hidden from consumer browsing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              form.is_active ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                form.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={16} />
                <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
