import type { ReactNode } from 'react'

type MenuIconName = 'home' | 'talents' | 'announcements' | 'woodpecker' | 'messages' | 'voice-room' | 'profile' | 'wallet' | 'orders' | 'workbench' | 'club-admin' | 'update' | 'record' | 'help' | 'settings' | 'support' | 'notification'

const artwork: Record<MenuIconName, ReactNode> = {
  update: <><path d="M12 15V4m-4 4 4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></>,
  record: <><rect x="3" y="6.5" width="13" height="11" rx="2" /><path d="m16 10 5-2.5v9L16 14zM8.2 12h2.6" /></>,
  help: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM9.3 9.1a2.8 2.8 0 0 1 5.5.5c0 1.9-2.8 2.3-2.8 4.2M12 17h.1" /></>,
  settings: <><path d="M4 7h16M4 17h16M4 12h16" /><circle cx="9" cy="7" r="2" fill="var(--prototype-surface, white)" /><circle cx="15" cy="12" r="2" fill="var(--prototype-surface, white)" /><circle cx="8" cy="17" r="2" fill="var(--prototype-surface, white)" /></>,
  support: <><path d="M4 13v-1a8 8 0 0 1 16 0v1M4 12h3v5H5a1 1 0 0 1-1-1zM20 12h-3v5h2a1 1 0 0 0 1-1zM19 17c-.5 2-2.4 3-5 3h-2" /></>,
  notification: <><path d="M5 17h14l-1.5-2.4V10a5.5 5.5 0 0 0-11 0v4.6zM10 19a2.2 2.2 0 0 0 4 0M12 3v1.5" /></>,
  home: <><path d="M3.5 10.2 12 3.7l8.5 6.5v9.1H3.5z" /><path d="M9 19.3v-6h6v6M8 7.1h8" /></>,
  talents: <><path d="m12 3 1.8 5.3 5.6.1-4.5 3.3 1.6 5.4-4.5-3.2-4.5 3.2 1.6-5.4-4.5-3.3 5.6-.1z" /><path d="m18.5 16.5.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7z" /></>,
  announcements: <><path d="M4 10.1v3.8h3.3l8.4 3.2V6.9l-8.4 3.2zM7.3 13.9l1.3 4.6h2.6l-1.4-3.7M18.4 9.1a4 4 0 0 1 0 5.8" /></>,
  woodpecker: <><path d="M6 19.5c0-4.3 2.2-7.2 5.9-8.4-1.5-1-2.2-2.3-2-4.1.2-2.2 1.9-3.5 4-3.5 2.4 0 3.9 1.6 4.1 3.8l2.5 1.2-2.9 1.2c-.7 2-2.1 3.1-4.2 3.4l3.8 6.4z" /><path d="M13.8 7.2h.1M8.5 16.8l3-2" /></>,
  messages: <><path d="M4 5.5h16v11H10l-4.5 3v-3H4z" /><path d="M7.5 9.5h9M7.5 12.5h6" /></>,
  'voice-room': <><path d="M4 12a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-6h4M4 12v4a2 2 0 0 0 2 2h2v-6zM16 20h-4" /></>,
  profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 19.5c.5-3.6 3-5.5 7-5.5s6.5 1.9 7 5.5z" /></>,
  wallet: <><path d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.5A2.5 2.5 0 0 1 2 17V8a3 3 0 0 1 3-3h11" /><path d="M20 11h-5a2 2 0 0 0 0 4h5M15 13h.1" /></>,
  orders: <><path d="M6 3.5h12v17l-3-1.6-3 1.6-3-1.6-3 1.6z" /><path d="M9 8h6M9 11.5h6M9 15h3" /></>,
  workbench: <><path d="M8 8h8c2 0 3.1 1.1 3.7 3.1l1.2 4.3c.5 1.9-1.5 3.1-3 1.9l-2.5-2H8.6l-2.5 2c-1.5 1.2-3.5 0-3-1.9l1.2-4.3C4.9 9.1 6 8 8 8z" /><path d="M7 11.8h4M9 9.8v4M16 11h.1M18 13h.1" /></>,
  'club-admin': <><path d="M4 20V7l8-3 8 3v13zM8 20v-5h8v5M8 9h2M14 9h2M8 12h2M14 12h2" /></>,
}

export function MenuIcon({ name, size = 16 }: { name: MenuIconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{artwork[name]}</svg>
}
