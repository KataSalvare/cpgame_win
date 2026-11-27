import cafe from '../assets/profile-life-photo-cafe.svg'
import review from '../assets/mock-review-match.svg'

export function demoImageKind(src: string) {
  return src === cafe ? 'life' : src === review ? 'review' : undefined
}
