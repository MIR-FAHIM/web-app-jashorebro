import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/model/authContext'
import { addressesApi } from '@/shared/api/addressesApi'
import { AddressFormModal } from './AddressFormModal'

export function AddressSetupPrompt() {
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsOpen(false)
      setHasChecked(false)
      return
    }

    const sessionDismissKey = `jb_address_setup_dismissed_${user.id}`
    const isDismissed = sessionStorage.getItem(sessionDismissKey)

    // Do not prompt if already dismissed or if welcome modal is currently pending
    if (isDismissed || sessionStorage.getItem('jb_login_welcome_pending') === 'true') {
      return
    }

    let isMounted = true

    // Fetch customer's saved addresses after authentication
    addressesApi
      .getAddresses()
      .then((addresses) => {
        if (!isMounted) return
        setHasChecked(true)
        // If request succeeds and returns NO addresses, show prompt modal
        if (Array.isArray(addresses) && addresses.length === 0) {
          setIsOpen(true)
        }
      })
      .catch((_err) => {
        // Do NOT treat API failure or network error as an empty list
        if (!isMounted) return
        setHasChecked(true)
      })

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.id])

  const handleDismissLater = () => {
    if (user?.id) {
      sessionStorage.setItem(`jb_address_setup_dismissed_${user.id}`, 'true')
    }
    setIsOpen(false)
  }

  const handleSaved = (_newAddress) => {
    if (user?.id) {
      sessionStorage.setItem(`jb_address_setup_dismissed_${user.id}`, 'true')
    }
    setIsOpen(false)
    // Dispatch window event so checkout or profile pages can reactively refresh
    window.dispatchEvent(new CustomEvent('jb_address_saved'))
  }

  if (!isOpen) return null

  return (
    <AddressFormModal
      isOpen={isOpen}
      onClose={handleDismissLater}
      isInitialSetup={true}
      onDismissLater={handleDismissLater}
      onSaved={handleSaved}
    />
  )
}
