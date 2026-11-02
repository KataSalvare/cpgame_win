import { createContext, useContext } from 'react'

export const EditAuthorizationContext = createContext<(() => Promise<boolean>) | null>(null)

export function useEditAuthorization() {
  const requestAuthorization = useContext(EditAuthorizationContext)
  if (!requestAuthorization) throw new Error('useEditAuthorization must be used within EditAuthorizationProvider')
  return requestAuthorization
}
