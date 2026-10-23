import type { Companion } from '../data/mockData'

export type ProfileCardData = {
  name: string
  initials: string
  status: string
  gender: string
  age: number
  userId: string
  rating: number
  friendCount?: number
  followingCount?: number
  followerCount?: number
  tags: string[]
  intro: string
}

export function companionToProfileCard(companion: Companion): ProfileCardData {
  const socialCounts: Record<string, [number, number, number]> = {
    'companion-001': [28, 136, 284],
    'companion-002': [42, 98, 516],
    'companion-003': [36, 117, 402],
    'companion-004': [51, 163, 738],
    'companion-005': [24, 87, 291],
    'companion-006': [63, 205, 906],
    'companion-007': [38, 142, 480],
    'companion-008': [47, 176, 633],
    'companion-009': [32, 109, 357],
  }
  const [friendCount, followingCount, followerCount] = socialCounts[companion.id] ?? [0, 0, 0]
  return {
    name: companion.name,
    initials: companion.initials,
    status: companion.status,
    gender: companion.gender,
    age: companion.age,
    userId: companion.id.replace('companion-', 'P-'),
    rating: companion.rating,
    friendCount,
    followingCount,
    followerCount,
    tags: companion.tags,
    intro: companion.intro,
  }
}
