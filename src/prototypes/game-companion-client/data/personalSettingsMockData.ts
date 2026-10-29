import softTone from '../assets/notification-soft.wav'
import bellTone from '../assets/notification-bell.wav'
import doubleTone from '../assets/notification-double.wav'

export const notificationSounds = [
  { id: 'soft', label: '轻提示.wav', src: softTone },
  { id: 'bell', label: '铃声.wav', src: bellTone },
  { id: 'double', label: '双音.wav', src: doubleTone },
] as const

export type NotificationChannel = 'privateMessages' | 'groupMessages' | 'orderUpdates' | 'announcements' | 'calls' | 'matches' | 'roomEntry'
export type NotificationPreference = { text: boolean; sound: boolean; soundId: string; volume: number }
export type NotificationPreferences = Record<NotificationChannel, NotificationPreference>

const defaultPreference = (): NotificationPreference => ({ text: true, sound: true, soundId: 'soft', volume: 60 })
export const initialNotificationPreferences: NotificationPreferences = {
  privateMessages: defaultPreference(),
  groupMessages: defaultPreference(),
  orderUpdates: defaultPreference(),
  announcements: defaultPreference(),
  calls: defaultPreference(),
  matches: defaultPreference(),
  roomEntry: defaultPreference(),
}

export type BlockedProfile = {
  id: string
  name: string
  initials: string
  profileId: string
  kind: '玩家' | '陪玩'
}
