import { Outlet } from 'react-router-dom'
import { ConsumerHeader } from './ConsumerHeader'
import { BottomNavigation } from './BottomNavigation'
import { DesktopNavigation } from './DesktopNavigation'

export function ConsumerLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-brand focus:px-4 focus:py-3 focus:text-on-brand">Skip to content</a>
      <ConsumerHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 sm:px-6 lg:gap-10">
        <DesktopNavigation />
        <main id="main-content" className="consumer-page min-w-0 flex-1 pt-5 md:py-8">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
    </div>
  )
}
