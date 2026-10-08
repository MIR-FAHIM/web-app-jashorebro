import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X, Tag, Sparkles } from 'lucide-react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { adminCatalogApi } from '../../api/adminCatalogApi'

export function AttributesManagerModal({ isOpen, onClose, onAttributesUpdated }) {
  const [attributes, setAttributes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAttr, setSelectedAttr] = useState(null)

  // New attribute form
  const [newAttrName, setNewAttrName] = useState('')
  const [newAttrType, setNewAttrType] = useState('button')
  const [newAttrIsVariant, setNewAttrIsVariant] = useState(true)

  // New item form
  const [newItemLabel, setNewItemLabel] = useState('')
  const [newItemValue, setNewItemValue] = useState('')
  const [newItemColor, setNewItemColor] = useState('')

  const loadAttributes = async () => {
    setIsLoading(true)
    try {
      const data = await adminCatalogApi.getAttributes()
      setAttributes(data)
      if (selectedAttr) {
        const refreshed = data.find((a) => a.id === selectedAttr.id)
        if (refreshed) setSelectedAttr(refreshed)
      } else if (data.length > 0) {
        setSelectedAttr(data[0])
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadAttributes()
    }
  }, [isOpen])

  const handleCreateAttribute = async (e) => {
    e.preventDefault()
    if (!newAttrName.trim()) return

    try {
      const created = await adminCatalogApi.createAttribute({
        name: newAttrName.trim(),
        type: newAttrType,
        is_variant: newAttrIsVariant,
      })
      setNewAttrName('')
      await loadAttributes()
      setSelectedAttr(created)
      if (onAttributesUpdated) onAttributesUpdated()
    } catch (err) {
      alert(err.message || 'Failed to create attribute.')
    }
  }

  const handleDeleteAttribute = async (id) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return
    try {
      await adminCatalogApi.deleteAttribute(id)
      await loadAttributes()
      if (selectedAttr?.id === id) {
        setSelectedAttr(null)
      }
      if (onAttributesUpdated) onAttributesUpdated()
    } catch (err) {
      alert(err.message || 'Failed to delete attribute.')
    }
  }

  const handleCreateItem = async (e) => {
    e.preventDefault()
    if (!selectedAttr || !newItemLabel.trim()) return

    const val = newItemValue.trim() || newItemLabel.trim().toLowerCase().replace(/\s+/g, '-')

    try {
      await adminCatalogApi.createAttributeItem(selectedAttr.id, {
        label: newItemLabel.trim(),
        value: val,
        color_code: selectedAttr.type === 'color' ? newItemColor : null,
      })
      setNewItemLabel('')
      setNewItemValue('')
      setNewItemColor('')
      await loadAttributes()
      if (onAttributesUpdated) onAttributesUpdated()
    } catch (err) {
      alert(err.message || 'Failed to create item.')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!selectedAttr) return
    try {
      await adminCatalogApi.deleteAttributeItem(selectedAttr.id, itemId)
      await loadAttributes()
      if (onAttributesUpdated) onAttributesUpdated()
    } catch (err) {
      alert(err.message || 'Failed to delete item.')
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Catalog Attributes & Options"
      description="Manage reusable variants (Color, Size) and specification properties."
      className="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2 text-xs">
        {/* Left: Attributes List & Creator (5 cols) */}
        <div className="md:col-span-5 space-y-4 border-r border-slate-800 pr-0 md:pr-4">
          <form onSubmit={handleCreateAttribute} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
            <p className="font-bold text-white text-xs flex items-center gap-1.5">
              <Plus size={14} className="text-orange-400" /> New Attribute
            </p>
            <input
              type="text"
              placeholder="e.g. Color, Size, Material"
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newAttrType}
                onChange={(e) => setNewAttrType(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none"
              >
                <option value="button">Button / Pill</option>
                <option value="color">Color Swatch</option>
                <option value="select">Dropdown Select</option>
              </select>

              <select
                value={newAttrIsVariant ? '1' : '0'}
                onChange={(e) => setNewAttrIsVariant(e.target.value === '1')}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none"
              >
                <option value="1">Variant Option</option>
                <option value="0">Specification</option>
              </select>
            </div>
            <Button type="submit" variant="drop-fire" size="xs" className="w-full font-bold">
              Add Attribute
            </Button>
          </form>

          {/* List */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {attributes.map((attr) => {
              const isSelected = selectedAttr?.id === attr.id
              return (
                <div
                  key={attr.id}
                  onClick={() => setSelectedAttr(attr)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold truncate">{attr.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {attr.items?.length || 0} items · {attr.is_variant ? 'Option' : 'Spec'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAttribute(attr.id)
                    }}
                    className="size-7 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Selected Attribute Items (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {selectedAttr ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedAttr.name} Options</h3>
                  <p className="text-[11px] text-slate-400">
                    Display: <span className="font-mono text-orange-400">{selectedAttr.type}</span> · {selectedAttr.is_variant ? 'Purchasable Variant' : 'Specification descriptor'}
                  </p>
                </div>
                <Badge size="xs" variant="unlocked" className="bg-slate-800 text-slate-300">
                  {selectedAttr.items?.length || 0} configured
                </Badge>
              </div>

              {/* Add item form */}
              <form onSubmit={handleCreateItem} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <p className="font-bold text-white text-xs">Add Item / Value</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Display Label (e.g. Midnight Black)"
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Unique Value (e.g. black)"
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                {selectedAttr.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newItemColor || '#000000'}
                      onChange={(e) => setNewItemColor(e.target.value)}
                      className="size-7 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Hex Code (e.g. #1a1a1a)"
                      value={newItemColor}
                      onChange={(e) => setNewItemColor(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-mono"
                    />
                  </div>
                )}

                <Button type="submit" variant="drop-fire" size="xs" className="font-bold">
                  Save Item
                </Button>
              </form>

              {/* Items List */}
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {selectedAttr.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.color_code && (
                        <span
                          className="size-3.5 rounded-full border border-slate-700 shrink-0"
                          style={{ backgroundColor: item.color_code }}
                        />
                      )}
                      <span className="font-medium text-white truncate">{item.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Select or create an attribute from the left to view options.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
