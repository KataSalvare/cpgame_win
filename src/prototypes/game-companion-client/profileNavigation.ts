export type ProfileSection = 'profile' | 'clubs' | 'onboarding' | 'visits' | 'favorites' | 'wealth' | 'cancel-account'

export function navigateToProfileSection(section: ProfileSection, onboardingEntry?: 'companion' | 'club') {
  const params = new URLSearchParams(window.location.hash.slice(1))
  params.set('page', 'profile')
  params.delete('tool')
  params.delete('support')
  params.delete('onboarding')
  if (section === 'profile') params.delete('section')
  else params.set('section', section)
  if (section === 'onboarding' && onboardingEntry) params.set('onboarding', onboardingEntry)
  const nextHash = params.toString()
  if (window.location.hash.slice(1) !== nextHash) window.location.hash = nextHash
}

export type ClientOverlay = 'help-center' | 'screen-recording' | 'client-notifications' | 'close-app' | 'platform-support' | 'club-support'

export function navigateToClientOverlay(overlay: ClientOverlay) {
  const params = new URLSearchParams(window.location.hash.slice(1))
  params.delete('tool')
  params.delete('support')
  if (overlay === 'club-support') {
    params.set('support', 'club')
  } else if (overlay === 'platform-support') {
    params.set('page', params.get('page') ?? 'home')
    params.set('support', 'platform')
  } else {
    params.set('page', params.get('page') ?? 'home')
    params.set('tool', overlay)
  }
  const nextHash = params.toString()
  if (window.location.hash.slice(1) !== nextHash) window.location.hash = nextHash
}

export function closeClientOverlay(overlay: ClientOverlay) {
  const params = new URLSearchParams(window.location.hash.slice(1))
  if (overlay === 'platform-support' || overlay === 'club-support') params.delete('support')
  else params.delete('tool')
  if (!params.has('page')) params.set('page', 'home')
  const nextHash = params.toString()
  if (window.location.hash.slice(1) !== nextHash) window.location.hash = nextHash
}

export function navigateToSystemSettings() {
  const returnHash = window.location.hash.slice(1)
  const params = new URLSearchParams({ page: 'system-settings' })
  if (returnHash) params.set('returnHash', returnHash)
  window.location.hash = params.toString()
}
