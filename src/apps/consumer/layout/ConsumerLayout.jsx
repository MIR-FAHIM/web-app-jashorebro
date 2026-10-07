import React from 'react'
import { Outlet } from 'react-router-dom'
import { ConsumerHeader } from './ConsumerHeader'
import { BottomNavigation } from './BottomNavigation'
import { DesktopNavigation } from './DesktopNavigation'

export function ConsumerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ConsumerHeader />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex">
        {/* Desktop Navigation Rail */}
        <DesktopNavigation />

        {/* Primary Content Canvas */}
        <main className="flex-1 w-full py-4 md:py-6 pb-24 md:pb-12 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation />
    </div>
  )
}
