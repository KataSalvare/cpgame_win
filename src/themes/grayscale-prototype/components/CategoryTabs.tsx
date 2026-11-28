import './category-tabs.css'
import type { ReactNode } from 'react'

type CategoryTab<T extends string> = { id: T; label: string; tabIcon?: ReactNode }
type Props<T extends string> = { label: string; items: readonly CategoryTab<T>[]; value: T; onChange: (value: T) => void; className?: string; variant?: 'navigation' | 'filter' }

export function CategoryTabs<T extends string>({ label, items, value, onChange, className = '', variant = 'navigation' }: Props<T>) {
  return <div className={`theme-category-tabs theme-category-tabs--${variant} ${className}`.trim()} role="tablist" aria-label={label}>
    {items.map((item) => <button type="button" role="tab" key={item.id} aria-selected={value === item.id} className={`theme-category-tabs__tab${value === item.id ? ' is-active' : ''}`} onClick={() => onChange(item.id)}>{item.tabIcon}{item.label}</button>)}
  </div>
}
