import type { Companion } from '../data/mockData'

export type ProfileCardData = {
  name: string
  initials: string
  status: string
  gender: string
  age: number
  userId: string
  rating: number
  tags: string[]
  intro: string
}

export function companionToProfileCard(companion: Companion): ProfileCardData {
  return {
    name: companion.name,
    initials: companion.initials,
    status: companion.status,
    gender: companion.gender,
    age: companion.age,
    userId: companion.id.replace('companion-', 'P-'),
    rating: companion.rating,
    tags: companion.tags,
    intro: companion.intro,
  }
}
