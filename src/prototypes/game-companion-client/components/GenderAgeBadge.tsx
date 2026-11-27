import { Mars, Venus } from 'lucide-react'

export function GenderAgeBadge({ gender, age, className = '' }: { gender: string; age: number | string; className?: string }) {
  const kind = gender === '男' ? 'male' : gender === '女' ? 'female' : 'unknown'
  return <span className={`gender-age-badge gender-age-badge--${kind}${className ? ` ${className}` : ''}`} aria-label={`${gender}，${age}岁`}>
    {kind === 'male' ? <Mars aria-hidden="true" /> : kind === 'female' ? <Venus aria-hidden="true" /> : <span aria-hidden="true">{gender}</span>}
    <span aria-hidden="true">{age}</span>
  </span>
}
