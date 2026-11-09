import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>('.windows-client-frame__main')
    if (!scrollContainer) return

    const updateVisibility = () => setVisible(scrollContainer.scrollTop > scrollContainer.clientHeight / 2)
    updateVisibility()
    scrollContainer.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)
    return () => {
      scrollContainer.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [])

  if (!visible) return null

  return <button type="button" className="client-back-to-top" onClick={() => document.querySelector<HTMLElement>('.windows-client-frame__main')?.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到顶部">
    <ArrowUp size={17} aria-hidden="true" />
    <span>回到顶部</span>
  </button>
}
