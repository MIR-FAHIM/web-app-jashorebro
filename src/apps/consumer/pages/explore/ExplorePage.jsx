import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, ImageOff, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useAuth } from '@/features/auth/model/authContext'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { MarketplaceProductCard } from '@/features/catalog/components/MarketplaceProductCard'
import { communityApi } from '@/features/community/api/communityApi'
import { dropFacts } from '@/features/drops/model/dropLifecycle'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { useLocale } from '@/shared/i18n/LocaleProvider'

const PAGE_SIZE = 9
const emptyResults = { key: null, products: [], productMeta: null, drops: [], dropMeta: null, failed: [] }
const readPage = (value) => /^\d+$/.test(value || '') && Number.isSafeInteger(Number(value)) ? Math.max(1, Number(value)) : 1
const flattenCategories = (categories) => categories.flatMap((category) => [category, ...flattenCategories(category.children || [])])

function DropSummary({ drop, compact = false }) {
  const { t, formatMoney, formatDate } = useLocale()
  const [imageFailed, setImageFailed] = useState(false)
  const facts = dropFacts(drop)
  const price = drop.groupPrice ?? drop.group_price
  const validPrice = price != null && String(price).trim() !== '' && Number.isFinite(Number(price)) && Number(price) >= 0
  const image = resolveImageUrl(drop.image || drop.product?.image)
  return (
    <Link to={`/drops/${drop.id}`} className="group flex min-w-0 gap-3 rounded-xl border border-line bg-surface p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
      <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-elevated text-muted ${compact ? 'size-14' : 'size-20'}`}>
        {image && !imageFailed ? <img src={image} alt="" loading="lazy" onError={() => setImageFailed(true)} className="size-full object-cover" /> : <ImageOff aria-hidden="true" size={22} />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={`${compact ? 'line-clamp-1' : 'line-clamp-2'} text-sm font-semibold leading-snug text-ink group-hover:text-brand`}>{drop.title}</h3>
        <p className={`mt-1 font-bold text-brand ${compact ? 'text-xs' : 'text-sm'}`}>{validPrice ? t('marketplace.dropPrice', { price: formatMoney(price) }) : t('marketplace.priceUnavailable')}</p>
        {!compact && <>
          <p className="mt-1 text-xs text-muted">{t('marketplace.dropBuyers', { count: facts.qualifying, target: facts.target })}</p>
          {drop.end_at && <p className="mt-1 text-xs text-muted">{t('marketplace.dropEnds', { date: formatDate(drop.end_at, { hour: 'numeric', minute: '2-digit' }) })}</p>}
        </>}
        <span className={compact ? 'sr-only' : 'mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand'}>{t('marketplace.viewDrop')}{!compact && <ArrowRight aria-hidden="true" size={13} />}</span>
      </div>
    </Link>
  )
}

export default function ExplorePage() {
  const { t } = useLocale()
  const { user, isLoading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('cat') || 'all'
  const dropsOnly = searchParams.get('tab') === 'drops'
  const productsOnly = searchParams.get('tab') === 'products'
  const page = readPage(searchParams.get('page'))
  const [draftQuery, setDraftQuery] = useState(query)
  const [categories, setCategories] = useState([])
  const [categoryError, setCategoryError] = useState(false)
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [categoryRetry, setCategoryRetry] = useState(0)
  const [results, setResults] = useState(emptyResults)
  const [fetching, setFetching] = useState(true)
  const [retry, setRetry] = useState(0)
  const resultsHeading = useRef(null)
  const focusResultsAfterLoad = useRef(false)
  const resultKey = JSON.stringify([user?.id || null, query, category, dropsOnly, productsOnly, page])
  const hasCurrentResults = results.key === resultKey
  const loading = authLoading || fetching || !hasCurrentResults
  const products = hasCurrentResults ? results.products : []
  const drops = hasCurrentResults ? results.drops : []
  const failed = hasCurrentResults ? results.failed : []
  const productError = failed.includes('products')
  const dropError = failed.includes('drops')
  const meta = dropsOnly ? results.dropMeta : results.productMeta
  const items = dropsOnly ? drops : products
  const primaryError = dropsOnly ? dropError : productError
  const total = Number(meta?.total || 0)
  const lastPage = Math.max(1, Number(meta?.last_page || 1))
  const hasFilters = Boolean(query || category !== 'all' || dropsOnly || productsOnly)

  useEffect(() => setDraftQuery(query), [query])
  useEffect(() => {
    let active = true
    setCategoryError(false)
    catalogApi.getCategories().then((data) => {
      if (active) { setCategories(Array.isArray(data) ? data : []); setCategoriesLoaded(true) }
    }).catch(() => { if (active) setCategoryError(true) })
    return () => { active = false }
  }, [categoryRetry])

  useEffect(() => {
    if (authLoading) return
    let active = true
    setFetching(true)
    setResults((previous) => previous.key === resultKey ? { ...previous, failed: [] } : { ...emptyResults, key: resultKey })
    const productsRequest = dropsOnly ? Promise.resolve(null) : catalogApi.getProducts({
      query, category: category === 'all' ? '' : category, page, per_page: PAGE_SIZE,
    })
    const dropsRequest = productsOnly ? Promise.resolve(null) : communityApi.drops.getPublicDropPage({
      q: query, category, page: dropsOnly ? page : 1,
    })
    const receive = (source, data, error = false) => {
      if (!active) return
      setResults((previous) => ({
        ...previous,
        ...(error ? {} : source === 'products'
          ? { products: data?.data || [], productMeta: data?.meta || null }
          : { drops: data?.data || data?.drops || [], dropMeta: data?.meta || null }),
        failed: [...previous.failed.filter((item) => item !== source), ...(error ? [source] : [])],
      }))
      if ((dropsOnly && source === 'drops') || (!dropsOnly && source === 'products')) setFetching(false)
    }
    // Publish each source independently: the optional summary cannot delay products.
    productsRequest.then((data) => receive('products', data), () => receive('products', null, true))
    dropsRequest.then((data) => receive('drops', data), () => receive('drops', null, true))
    return () => { active = false }
  }, [authLoading, user?.id, query, category, page, dropsOnly, productsOnly, resultKey, retry])

  useEffect(() => {
    if (!loading && focusResultsAfterLoad.current) {
      focusResultsAfterLoad.current = false
      resultsHeading.current?.focus({ preventScroll: true })
      resultsHeading.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [loading])

  const updateParams = (changes, { focus = false } = {}) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
      if (value == null || value === '') next.delete(key)
      else next.set(key, String(value))
    })
    focusResultsAfterLoad.current = focus
    navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { preventScrollReset: true })
  }
  const search = (event) => {
    event.preventDefault()
    updateParams({ q: draftQuery.trim() || null, page: null })
  }
  const resetFilters = () => updateParams({ q: null, cat: null, tab: null, page: null })
  const selectCategory = (value) => updateParams({ cat: value === 'all' ? null : value, page: null })
  const handleSaved = (productId, pick) => setResults((previous) => ({
    ...previous,
    products: previous.products.map((product) => product.id === productId ? {
      ...product, current_user: { ...product.current_user, has_picked: true, pick_id: pick?.id || product.current_user?.pick_id },
    } : product),
  }))
  const selectedCategory = flattenCategories(categories).find((item) => item.slug === category || String(item.id) === category)
  const categoryMissing = categoriesLoaded && !categoryError && category !== 'all' && !selectedCategory
  const first = items.length ? (page - 1) * (dropsOnly ? 20 : PAGE_SIZE) + 1 : 0
  const end = first ? first + items.length - 1 : 0

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{t('shop.heading')}</h1>
        {dropsOnly && <button type="button" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand" onClick={() => updateParams({ tab: null, page: null })}><ArrowLeft aria-hidden="true" size={15} />{t('marketplace.backProducts')}</button>}
      </div>
      <form role="search" onSubmit={search} className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" aria-label={t('marketplace.searchLabel')} placeholder={t('marketplace.searchPlaceholder')} value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} className="h-12 w-full rounded-xl border border-field-border bg-surface pl-10 pr-11 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
          {(draftQuery || query) && <button type="button" aria-label={t('marketplace.clearSearch')} onClick={() => { setDraftQuery(''); updateParams({ q: null, page: null }) }} className="absolute right-0 top-0 flex size-12 items-center justify-center rounded-xl text-muted hover:text-ink"><X size={17} aria-hidden="true" /></button>}
        </div>
        <Button type="submit" className="min-h-12 shrink-0 px-3 sm:px-5">{t('marketplace.search')}</Button>
      </form>
      <div role="group" aria-label={t('marketplace.categories')} className="flex gap-2 overflow-x-auto pb-1">
        {[{ id: 'all', slug: 'all', name: t('marketplace.allCategories') }, ...categories].map((item) => (
          <button type="button" key={item.id} aria-pressed={category === item.slug} onClick={() => selectCategory(item.slug)} className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-colors ${category === item.slug ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-soft hover:border-brand hover:text-ink'}`}>{item.name}</button>
        ))}
      </div>
      {categoryError && <p role="status" className="text-xs text-muted">{t('marketplace.categoriesError')} <button type="button" onClick={() => setCategoryRetry((value) => value + 1)} className="inline-flex min-h-11 items-center font-semibold text-brand underline">{t('marketplace.retry')}</button></p>}
      {(query || category !== 'all') && <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-soft">
        {query && <span className="break-all">{t('marketplace.query', { query })}</span>}
        {category !== 'all' && <button type="button" onClick={() => selectCategory('all')} className="inline-flex min-h-11 max-w-full items-center gap-1 rounded-lg border border-line px-2 text-left" aria-label={t('marketplace.removeCategory', { category: selectedCategory?.name || category })}><span className="break-all">{selectedCategory?.name || t('marketplace.unknownCategory')}</span><X size={13} aria-hidden="true" className="shrink-0" /></button>}
        <button type="button" onClick={resetFilters} className="min-h-11 font-semibold text-brand underline">{t('marketplace.reset')}</button>
      </div>}
      {!dropsOnly && !productsOnly && hasCurrentResults && drops.length > 0 && <section aria-label={t('marketplace.activeDrops')} className="space-y-2 rounded-2xl bg-brand/5 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <h2 className="text-sm font-bold text-ink">{t('marketplace.activeDrops')}</h2>
          <button type="button" onClick={() => updateParams({ tab: 'drops', page: null })} className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-brand">{t('marketplace.seeDrops')}<ArrowRight size={14} aria-hidden="true" /></button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">{drops.slice(0, 2).map((drop, index) => <div key={drop.id} className={index > 0 ? 'hidden sm:block' : ''}><DropSummary drop={drop} compact /></div>)}</div>
      </section>}
      {!dropsOnly && dropError && !loading && <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3 text-xs text-muted"><span>{t('marketplace.dropsError')}</span><button type="button" className="min-h-11 font-semibold text-brand underline" onClick={() => setRetry((value) => value + 1)}>{t('marketplace.retry')}</button></div>}
      <section aria-labelledby="catalog-heading" aria-busy={loading} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 ref={resultsHeading} id="catalog-heading" tabIndex={-1} className="scroll-mt-24 text-base font-bold text-ink outline-none">{t(dropsOnly ? 'marketplace.activeDrops' : 'marketplace.products')}</h2>
          <p role="status" className="text-right text-xs text-muted">{loading ? t('marketplace.loading') : primaryError ? t(items.length ? 'marketplace.cachedResults' : 'marketplace.itemsUnavailable') : t('marketplace.resultCount', { first, end, count: total })}</p>
        </div>
        {dropsOnly && <p className="text-sm text-muted">{t('marketplace.dropCondition')}</p>}
        {loading && <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-muted"><Loader2 aria-hidden="true" size={21} className="animate-spin text-brand" />{t('marketplace.loading')}</div>}
        {!loading && primaryError && <Card role="alert" className="space-y-3 p-5 text-center"><AlertCircle aria-hidden="true" className="mx-auto text-brand" size={24} /><h3 className="font-semibold text-ink">{t('marketplace.loadError')}</h3><p className="text-sm text-muted">{t(items.length ? 'marketplace.keptResults' : 'marketplace.tryAgain')}</p><Button variant="outline" onClick={() => setRetry((value) => value + 1)}>{t('marketplace.retry')}</Button></Card>}
        {items.length > 0 && <div className={dropsOnly ? 'grid gap-3 sm:grid-cols-2' : 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3'}>{dropsOnly ? drops.map((drop) => <DropSummary key={drop.id} drop={drop} />) : products.map((product) => <MarketplaceProductCard key={`${user?.id || 'guest'}-${product.id}`} product={product} onSaved={handleSaved} />)}</div>}
        {!loading && !primaryError && items.length === 0 && <Card className="space-y-3 px-5 py-10 text-center"><Search aria-hidden="true" size={27} className="mx-auto text-muted" /><h3 className="text-lg font-semibold text-ink">{t(page > lastPage ? 'marketplace.emptyPage' : 'marketplace.noMatches')}</h3><p className="text-sm text-muted">{t(categoryMissing ? 'marketplace.categoryUnavailable' : hasFilters ? 'marketplace.changeSearch' : 'marketplace.noProducts')}</p><Button variant="outline" onClick={page > 1 ? () => updateParams({ page: null }, { focus: true }) : hasFilters ? resetFilters : () => setRetry((value) => value + 1)}>{t(page > 1 ? 'marketplace.firstPage' : hasFilters ? 'marketplace.reset' : 'marketplace.retry')}</Button></Card>}
        {!loading && !primaryError && items.length > 0 && lastPage > 1 && <nav aria-label={t('marketplace.pagination')} className="flex items-center justify-between gap-2 border-t border-line pt-4">
          <Button variant="outline" className="gap-1 px-3" disabled={page <= 1} onClick={() => updateParams({ page: page > 2 ? page - 1 : null }, { focus: true })}><ArrowLeft size={16} aria-hidden="true" />{t('marketplace.previous')}</Button>
          <span className="text-center text-xs text-muted">{t('marketplace.page', { page, count: lastPage })}</span>
          <Button variant="outline" className="gap-1 px-3" disabled={page >= lastPage} onClick={() => updateParams({ page: page + 1 }, { focus: true })}>{t('marketplace.next')}<ArrowRight size={16} aria-hidden="true" /></Button>
        </nav>}
      </section>
    </div>
  )
}
