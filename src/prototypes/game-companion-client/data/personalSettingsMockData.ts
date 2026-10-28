export type NotificationPreferences = {
  desktopReminder: boolean
  sound: boolean
  privateMessages: boolean
  groupMessages: boolean
  orderUpdates: boolean
  announcements: boolean
}

export const initialNotificationPreferences: NotificationPreferences = {
  desktopReminder: true,
  sound: true,
  privateMessages: true,
  groupMessages: true,
  orderUpdates: true,
  announcements: true,
}

export type BlockedProfile = {
  id: string
  name: string
  initials: string
  profileId: string
  kind: '玩家' | '陪玩'
}
