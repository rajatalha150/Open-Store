'use client'

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'

export interface StoreSettingsData {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeCity: string
  storeState: string
  storeZip: string
  currency: string
  timezone: string
  enableNotifications: boolean
  enableNewsletter: boolean
  enableReviews: boolean
  enableWishlist: boolean
  stripePublishableKey: string
  logoUrl: string
}

const defaultSettings: StoreSettingsData = {
  storeName: 'My Store',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  storeCity: '',
  storeState: '',
  storeZip: '',
  currency: 'USD',
  timezone: 'America/New_York',
  enableNotifications: false,
  enableNewsletter: false,
  enableReviews: false,
  enableWishlist: false,
  stripePublishableKey: '',
  logoUrl: '',
}

const StoreSettingsContext = createContext<StoreSettingsData>(defaultSettings)

const STORE_SETTINGS_UPDATED_EVENT = 'store-settings-updated'

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettingsData>(defaultSettings)

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' })
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Failed to load store settings:', err)
    }
  }, [])

  useEffect(() => {
    loadSettings()

    const handleSettingsUpdated = () => {
      loadSettings()
    }

    const handleWindowFocus = () => {
      loadSettings()
    }

    window.addEventListener(STORE_SETTINGS_UPDATED_EVENT, handleSettingsUpdated)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.removeEventListener(STORE_SETTINGS_UPDATED_EVENT, handleSettingsUpdated)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [loadSettings])

  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext)
}

export function notifyStoreSettingsUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(STORE_SETTINGS_UPDATED_EVENT))
}

export function formatAddress(settings: StoreSettingsData): string {
  const { storeAddress, storeCity, storeState, storeZip } = settings
  const cityStateZip = [storeCity, [storeState, storeZip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [storeAddress, cityStateZip].filter(Boolean).join(', ')
}
