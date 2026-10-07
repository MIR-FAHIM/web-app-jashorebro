import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex min-h-dvh bg-canvas text-ink">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-safe md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
