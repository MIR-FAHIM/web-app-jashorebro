import { useState, useEffect, useMemo } from 'react'
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Layers,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
  RefreshCw,
  FolderPlus,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { adminCatalogApi } from '../../api/adminCatalogApi'
import { CategoryFormModal } from './CategoryFormModal'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [parentLookup, setParentLookup] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'
  const [expandedParents, setExpandedParents] = useState({}) // { [id]: boolean }

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [initialParentId, setInitialParentId] = useState(null)

  // Feedback State
  const [actionAlert, setActionAlert] = useState(null) // { type: 'success' | 'error', message: string }

  const loadData = async () => {
    setIsLoading(true)
    setActionAlert(null)
    try {
      const activeParam =
        statusFilter === 'active' ? '1' : statusFilter === 'inactive' ? '0' : ''

      const [cats, parents] = await Promise.all([
        adminCatalogApi.getCategories({
          q: searchQuery.trim(),
          is_active: activeParam,
          tree: !searchQuery.trim(),
        }),
        adminCatalogApi.getParentCategories(),
      ])

      setCategories(cats || [])
      setParentLookup(parents || [])

      // Auto-expand all root categories by default if not searching
      if (!searchQuery.trim() && cats) {
        const expandedMap = {}
        cats.forEach((c) => {
          expandedMap[c.id] = true
        })
        setExpandedParents((prev) => ({ ...expandedMap, ...prev }))
      }
    } catch (err) {
      setActionAlert({
        type: 'error',
        message: err.message || 'Failed to load categories.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [searchQuery, statusFilter])

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let total = 0
    let roots = 0
    let subcategories = 0
    let active = 0

    if (searchQuery.trim()) {
      // Flat list
      total = categories.length
      categories.forEach((c) => {
        if (c.parent_id) subcategories++
        else roots++
        if (c.is_active) active++
      })
    } else {
      // Tree list
      roots = categories.length
      categories.forEach((root) => {
        total++
        if (root.is_active) active++
        if (root.children && Array.isArray(root.children)) {
          subcategories += root.children.length
          total += root.children.length
          root.children.forEach((sub) => {
            if (sub.is_active) active++
          })
        }
      })
    }

    return { total, roots, subcategories, active }
  }, [categories, searchQuery])

  // Handlers
  const handleOpenCreateRoot = () => {
    setCategoryToEdit(null)
    setInitialParentId(null)
    setIsModalOpen(true)
  }

  const handleOpenAddSubcategory = (parentId) => {
    setCategoryToEdit(null)
    setInitialParentId(parentId)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (category) => {
    setCategoryToEdit(category)
    setInitialParentId(category.parent_id || null)
    setIsModalOpen(true)
  }

  const handleDelete = async (category) => {
    const isRoot = !category.parent_id
    const childCount = category.children?.length || 0
    const prodCount = category.products_count || 0

    if (childCount > 0) {
      setActionAlert({
        type: 'error',
        message: `Cannot delete '${category.name}' because it contains ${childCount} subcategories. Please reassign or delete subcategories first.`,
      })
      return
    }

    if (prodCount > 0) {
      setActionAlert({
        type: 'error',
        message: `Cannot delete '${category.name}' because ${prodCount} product(s) are assigned to it. Reassign products first.`,
      })
      return
    }

    const confirmMsg = isRoot
      ? `Are you sure you want to delete root category '${category.name}'?`
      : `Are you sure you want to delete subcategory '${category.name}'?`

    if (!window.confirm(confirmMsg)) return

    try {
      await adminCatalogApi.deleteCategory(category.id)
      setActionAlert({
        type: 'success',
        message: `Category '${category.name}' deleted successfully.`,
      })
      loadData()
    } catch (err) {
      setActionAlert({
        type: 'error',
        message: err.message || 'Failed to delete category.',
      })
    }
  }

  const toggleParentExpand = (id) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleAllExpanded = (expand) => {
    const map = {}
    categories.forEach((c) => {
      map[c.id] = expand
    })
    setExpandedParents(map)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <FolderTree size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Category Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize parent departments and subcategories across the JashoreBro catalog with full hierarchy control.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            onClick={loadData}
            disabled={isLoading}
            className="border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="text-xs ml-1.5">Refresh</span>
          </Button>

          <Button
            onClick={handleOpenCreateRoot}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-600/20"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-slate-900 border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Categories</span>
            <span className="size-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <FolderTree size={16} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.total}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across entire catalog</p>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Root Departments</span>
            <span className="size-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers size={16} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.roots}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Top-level navigation tiers</p>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Subcategories</span>
            <span className="size-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CornerDownRight size={16} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.subcategories}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Nested sub-departments</p>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Live</span>
            <span className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">{metrics.active}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Visible to shoppers</p>
        </Card>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            actionAlert.type === 'error'
              ? 'bg-red-950/80 border-red-500/40 text-red-200'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'error' ? (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionAlert(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-slate-900 border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search category name, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'active', label: 'Active Only' },
              { id: 'inactive', label: 'Inactive' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Expand / Collapse All for Tree View */}
          {!searchQuery.trim() && categories.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAllExpanded(true)}
                className="text-[11px] text-slate-400 hover:text-white py-1 px-2.5 h-8"
              >
                Expand All
              </Button>
              <span className="text-slate-700">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAllExpanded(false)}
                className="text-[11px] text-slate-400 hover:text-white py-1 px-2.5 h-8"
              >
                Collapse All
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Main Categories Tree / List View */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12 text-center bg-slate-900 border-slate-800">
            <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">Loading catalog categories...</p>
            <p className="text-xs text-slate-500 mt-1">Fetching parent and child relationships</p>
          </Card>
        ) : categories.length === 0 ? (
          <Card className="p-12 text-center bg-slate-900 border-slate-800">
            <FolderTree size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">No categories found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No categories match "${searchQuery}". Try a different keyword.`
                : 'Get started by creating your first top-level department.'}
            </p>
            <div className="mt-4">
              <Button
                onClick={handleOpenCreateRoot}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Create Root Category</span>
              </Button>
            </div>
          </Card>
        ) : searchQuery.trim() ? (
          /* Search Results View (Flat List with Parent Context) */
          <div className="space-y-2">
            <p className="text-xs text-slate-400 px-1">
              Search results for <span className="text-white font-bold">"{searchQuery}"</span> ({categories.length} found):
            </p>
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="p-3.5 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="size-9 rounded-xl bg-slate-950 border border-slate-800 text-orange-400 flex items-center justify-center shrink-0">
                      <FolderTree size={18} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{cat.name}</span>
                        {cat.parent ? (
                          <Badge
                            size="sm"
                            className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]"
                          >
                            ↳ Sub of {cat.parent.name}
                          </Badge>
                        ) : (
                          <Badge
                            size="sm"
                            className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-[10px]"
                          >
                            Root Department
                          </Badge>
                        )}
                        <span className="text-[11px] font-mono text-slate-500">/{cat.slug}</span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Badge
                      size="sm"
                      className="bg-slate-950 text-slate-300 border-slate-800 text-[11px] gap-1"
                    >
                      <ShoppingBag size={12} className="text-slate-400" />
                      {cat.products_count ?? 0} Products
                    </Badge>

                    {cat.is_active ? (
                      <Badge
                        size="sm"
                        className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] gap-1"
                      >
                        <Eye size={12} />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        size="sm"
                        className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] gap-1"
                      >
                        <EyeOff size={12} />
                        Hidden
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(cat)}
                      className="h-8 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit size={14} />
                      <span className="text-xs ml-1">Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cat)}
                      className="h-8 px-2.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Tree View: Grouped by Root with Nested Children */
          <div className="space-y-3">
            {categories.map((root) => {
              const isExpanded = expandedParents[root.id] ?? true
              const children = root.children || []

              return (
                <div
                  key={root.id}
                  className="rounded-2xl border border-slate-800/90 bg-slate-900 overflow-hidden shadow-sm transition-all"
                >
                  {/* Root Category Row */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Expand / Collapse Chevron Button */}
                      <button
                        type="button"
                        onClick={() => toggleParentExpand(root.id)}
                        className="size-7 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-transform"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {/* Icon */}
                      <span className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                        <FolderTree size={20} />
                      </span>

                      {/* Title, Slug & Stats */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-white tracking-tight">
                            {root.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            /{root.slug}
                          </span>
                          {root.order_index > 0 && (
                            <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              Order: #{root.order_index}
                            </span>
                          )}
                        </div>
                        {root.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {root.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Root Action Controls */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      <Badge
                        size="sm"
                        className="bg-slate-950 text-slate-300 border-slate-800 text-[11px] gap-1"
                      >
                        <ShoppingBag size={12} className="text-slate-400" />
                        {root.products_count ?? 0} Products
                      </Badge>

                      <Badge
                        size="sm"
                        className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[11px] gap-1"
                      >
                        <CornerDownRight size={12} />
                        {children.length} Subcategories
                      </Badge>

                      {root.is_active ? (
                        <Badge
                          size="sm"
                          className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] gap-1"
                        >
                          <Eye size={12} />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          size="sm"
                          className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] gap-1"
                        >
                          <EyeOff size={12} />
                          Inactive
                        </Badge>
                      )}

                      {/* Add Subcategory Button */}
                      <Button
                        size="sm"
                        onClick={() => handleOpenAddSubcategory(root.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-orange-300 border border-slate-700 text-xs font-bold h-8 px-2.5 rounded-lg flex items-center gap-1.5"
                      >
                        <FolderPlus size={14} />
                        <span>+ Subcategory</span>
                      </Button>

                      {/* Edit Root */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(root)}
                        className="h-8 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Edit size={14} />
                        <span className="text-xs ml-1">Edit</span>
                      </Button>

                      {/* Delete Root */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(root)}
                        className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Nested Subcategories List */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 bg-slate-950/60 p-2 sm:p-3 space-y-1.5">
                      {children.length === 0 ? (
                        <div className="py-4 px-3 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                          <p>No subcategories under {root.name} yet.</p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSubcategory(root.id)}
                            className="mt-1.5 text-orange-400 hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <Plus size={12} /> Add the first subcategory
                          </button>
                        </div>
                      ) : (
                        children.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/50 border border-slate-800/60 ml-2 sm:ml-6 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Visual Tree Connector */}
                              <span className="text-slate-600 font-mono text-sm shrink-0">
                                ↳
                              </span>

                              {/* Sub Icon */}
                              <span className="size-8 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                                <CornerDownRight size={14} />
                              </span>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs sm:text-sm text-slate-100">
                                    {sub.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    /{sub.slug}
                                  </span>
                                  {sub.order_index > 0 && (
                                    <span className="text-[9px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                                      Order: #{sub.order_index}
                                    </span>
                                  )}
                                </div>
                                {sub.description && (
                                  <p className="text-[11px] text-slate-400 line-clamp-1">
                                    {sub.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <Badge
                                size="sm"
                                className="bg-slate-950 text-slate-400 border-slate-800 text-[10px] gap-1"
                              >
                                <ShoppingBag size={11} />
                                {sub.products_count ?? 0}
                              </Badge>

                              {sub.is_active ? (
                                <Badge
                                  size="sm"
                                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
                                >
                                  Active
                                </Badge>
                              ) : (
                                <Badge
                                  size="sm"
                                  className="bg-slate-800 text-slate-500 border-slate-700 text-[10px]"
                                >
                                  Inactive
                                </Badge>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(sub)}
                                className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Edit size={13} />
                                <span className="text-[11px] ml-1">Edit</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(sub)}
                                className="h-7 px-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={categoryToEdit}
        initialParentId={initialParentId}
        parentCategories={parentLookup}
        onSaved={loadData}
      />
    </div>
  )
}
