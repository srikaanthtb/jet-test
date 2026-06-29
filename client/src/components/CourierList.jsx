import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function CourierList() {
  const [couriers, setCouriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vehicleFilter, setVehicleFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    fetch('/couriers')
      .then(res => res.json())
      .then(data => {
        setCouriers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch couriers:', err)
        setLoading(false)
      })
  }, [])

  const getInitials = (name) => {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Extract unique vehicles for filter dropdown
  const uniqueVehicles = ['all', ...new Set(couriers.map(c => c.vehicle).filter(Boolean))]

  // Filtering Logic
  const filteredCouriers = couriers.filter(courier => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = !query || 
      (courier.name && courier.name.toLowerCase().includes(query)) ||
      (courier.city && courier.city.toLowerCase().includes(query)) ||
      (courier.employeeId && courier.employeeId.toLowerCase().includes(query)) ||
      (courier.globalCourierId && courier.globalCourierId.toLowerCase().includes(query))

    const matchesStatus = statusFilter === 'all' || courier.onboardingStatus === statusFilter
    const matchesVehicle = vehicleFilter === 'all' || courier.vehicle === vehicleFilter

    return matchesSearch && matchesStatus && matchesVehicle
  })

  // Count summaries
  const verifiedCount = couriers.filter(c => c.onboardingStatus === 'verified').length
  const pendingCount = couriers.filter(c => c.onboardingStatus === 'pending').length

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-border/60 rounded-md animate-pulse" />
            <div className="h-4 w-64 bg-border/40 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-border/50 rounded-md animate-pulse" />
            <div className="h-9 w-24 bg-border/50 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Skeleton filters bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-10 bg-border/45 rounded-lg animate-pulse" />
          <div className="h-10 bg-border/45 rounded-lg animate-pulse" />
          <div className="h-10 bg-border/45 rounded-lg animate-pulse" />
        </div>

        {/* Skeletons depending on layout mode */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`border border-border/80 rounded-xl p-5 bg-surface animate-pulse ${viewMode === 'list' ? 'flex items-center gap-4' : 'space-y-4'}`}>
              {viewMode === 'list' ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-border/60 shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-border/60 rounded w-1/4" />
                    <div className="h-3 bg-border/40 rounded w-12" />
                  </div>
                  <div className="h-4 bg-border/40 rounded w-24 shrink-0" />
                  <div className="h-4 bg-border/40 rounded w-16 shrink-0" />
                  <div className="h-5 bg-border/60 rounded-full w-20 shrink-0" />
                </>
              ) : (
                <>
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-border/60 shrink-0" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-border/60 rounded w-3/4" />
                      <div className="h-3 bg-border/40 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-4 bg-border/40 rounded w-1/2" />
                  <div className="pt-3 border-t border-border/60 flex gap-2">
                    <div className="h-3 bg-border/50 rounded w-1/3" />
                    <div className="h-3 bg-border/50 rounded w-1/3" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title & Stats Summary Panel */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-ink-headings tracking-tight">Courier Registry</h2>
          <p className="text-sm text-muted mt-1">
            Monitor, filter, and track onboarding status of delivery agents.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-light text-primary border border-primary/10 rounded-md">
            All: <span className="font-bold font-mono">{couriers.length}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-status-success-bg text-status-success-text border border-status-success-text/10 rounded-md">
            Verified: <span className="font-bold font-mono">{verifiedCount}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-status-warning-bg text-status-warning-text border border-status-warning-text/10 rounded-md">
            Pending: <span className="font-bold font-mono">{pendingCount}</span>
          </span>
        </div>
      </div>

      {/* Control Panel: Search, Filters, and Layout Toggle */}
      <div className="bg-bg-app border border-border rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, city, employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-surface border border-border rounded-lg text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted hover:text-ink"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Vehicle Dropdown */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer capitalize"
            >
              <option value="all">All Vehicles</option>
              {uniqueVehicles.filter(v => v !== 'all').map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Layout Toggle */}

          <div data-impeccable-variants="60b63537" data-impeccable-variant-count="2" style={{ display: "contents" }}>
            {/* impeccable-variants-start 60b63537 */}
            {/* Original */}
            <div data-impeccable-variant="original">
              <div className="flex border border-border rounded-lg bg-surface p-1 shrink-0 gap-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-primary-light text-primary font-semibold' 
                      : 'text-muted hover:text-ink'
                  }`}
                  title="Grid View"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-xs font-medium">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-primary-light text-primary font-semibold' 
                      : 'text-muted hover:text-ink'
                  }`}
                  title="List View"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-xs font-medium">List</span>
                </button>
              </div>
            </div>
            {/* Variants: insert below this line */}
            <style data-impeccable-css="60b63537">{`
              @scope ([data-impeccable-variant="1"]) {
                :scope > .imp-vt1 {
                  display: inline-flex;
                  border: 1px solid oklch(0.91 0.008 230);
                  border-radius: calc(var(--p-density, 1) * 8px);
                  background: oklch(1 0 0);
                  padding: calc(var(--p-density, 1) * 3px);
                  gap: calc(var(--p-density, 1) * 2px);
                }
                :scope > .imp-vt1 .imp-vt1-btn {
                  display: inline-flex;
                  align-items: center;
                  gap: calc(var(--p-density, 1) * 6px);
                  padding: calc(var(--p-density, 1) * 5px) calc(var(--p-density, 1) * 10px);
                  border-radius: calc(var(--p-density, 1) * 6px);
                  border: none;
                  background: transparent;
                  cursor: pointer;
                  font-family: Inter, system-ui, sans-serif;
                  font-size: 12px;
                  font-weight: 500;
                  color: oklch(0.5 0.012 230);
                  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
                  line-height: 1;
                }
                :scope > .imp-vt1 .imp-vt1-btn:hover {
                  color: oklch(0.25 0.015 230);
                }
                :scope > .imp-vt1 .imp-vt1-btn.active {
                  background: oklch(0.92 0.02 230);
                  color: oklch(0.55 0.105 230);
                  font-weight: 600;
                }
                :scope > .imp-vt1 .imp-vt1-btn svg {
                  width: 14px;
                  height: 14px;
                  flex-shrink: 0;
                }
              }
            `}</style>
            {/* impeccable-variants-end 60b63537 */}
          </div>

        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
          <span className="text-xs font-bold text-muted uppercase tracking-wider mr-2">Filter status:</span>
          {['all', 'verified', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-ink border-border hover:bg-surface-hover hover:border-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results Listing */}
      {filteredCouriers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-surface">
          <svg className="mx-auto h-12 w-12 text-muted/65" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-base font-bold text-ink-headings">No Couriers Found</h3>
          <p className="mt-2 text-sm text-muted">Try adjusting your filters or search query to find matching agents.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID LAYOUT (Bento-like responsive cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredCouriers.map((courier) => {
            const courierId = courier.employeeId || courier.globalCourierId
            const isVerified = courier.onboardingStatus === 'verified'

            return (
              <Link
                key={courierId}
                to={`/courier/${courierId}`}
                className="group flex flex-col justify-between border border-border rounded-xl p-5 bg-surface hover:border-primary/45 hover:shadow-[0_8px_30px_-6px_rgba(88,101,242,0.06)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div>
                  <div className="flex gap-3.5 items-start">
                    {/* Circle initials avatar */}
                    <div className="w-11 h-11 rounded-full bg-primary-light border border-primary/10 text-primary flex items-center justify-center font-bold text-sm tracking-wide shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                      {getInitials(courier.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {courier.name}
                      </h3>
                      <p className="text-xs text-muted font-medium mt-0.5">{courier.city}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-bg-app border border-border/80 px-2 py-0.5 rounded-md">
                      {courier.vehicle}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isVerified
                        ? 'bg-status-success-bg text-status-success-text border-status-success-text/10'
                        : 'bg-status-warning-bg text-status-warning-text border-status-warning-text/10'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${isVerified ? 'bg-status-success-text' : 'bg-status-warning-text'}`} />
                      {courier.onboardingStatus}
                    </span>
                  </div>
                </div>

                {/* Inline IDs block */}
                <div className="mt-5 pt-4 border-t border-border flex flex-col gap-2">
                  <div className="text-[10px] text-muted flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider">Employee ID:</span>
                    <span className="font-mono text-ink bg-bg-app px-2 py-0.5 rounded border border-border/40">
                      {courier.employeeId || 'N/A'}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider">Global ID:</span>
                    <span className="font-mono text-ink bg-bg-app px-2 py-0.5 rounded border border-border/40">
                      {courier.globalCourierId || 'N/A'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        /* LIST LAYOUT (snug, dense table rows) */
        <div className="flex flex-col gap-3 animate-fadeIn">
          {filteredCouriers.map((courier) => {
            const courierId = courier.employeeId || courier.globalCourierId
            const isVerified = courier.onboardingStatus === 'verified'

            return (
              <Link
                key={courierId}
                to={`/courier/${courierId}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between border border-border rounded-xl p-4 bg-surface hover:border-primary/45 hover:bg-surface-hover transition-all duration-200 gap-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Small initials avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-light border border-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    {getInitials(courier.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-ink group-hover:text-primary transition-colors duration-200 truncate">
                      {courier.name}
                    </h3>
                    <p className="text-xs text-muted truncate mt-0.5">{courier.city}</p>
                  </div>
                </div>

                {/* IDs inline */}
                <div className="flex items-center gap-3 text-[10px] text-muted flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[9px]">EMP:</span>
                    <span className="font-mono text-ink bg-bg-app px-1.5 py-0.5 rounded border border-border/40">
                      {courier.employeeId || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[9px]">GLO:</span>
                    <span className="font-mono text-ink bg-bg-app px-1.5 py-0.5 rounded border border-border/40">
                      {courier.globalCourierId || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 ml-auto sm:ml-0 w-full sm:w-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-bg-app border border-border/80 px-2 py-0.5 rounded-md">
                    {courier.vehicle}
                  </span>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isVerified
                      ? 'bg-status-success-bg text-status-success-text border-status-success-text/10'
                      : 'bg-status-warning-bg text-status-warning-text border-status-warning-text/10'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${isVerified ? 'bg-status-success-text' : 'bg-status-warning-text'}`} />
                    {courier.onboardingStatus}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CourierList