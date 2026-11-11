import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)
  const [rightOffset, setRightOffset] = useState(34)

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>('.windows-client-frame__main')
    if (!scrollContainer) return
    const frame = scrollContainer.closest<HTMLElement>('.windows-client-frame')

    const updateVisibility = () => setVisible(scrollContainer.scrollTop > scrollContainer.clientHeight / 2)
    const updatePosition = () => {
      const rightPanel = frame?.querySelector<HTMLElement>('.windows-client-frame__right-panel')
      setRightOffset(34 + (rightPanel?.offsetWidth ?? 0))
    }
    const resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(scrollContainer)
    const workspace = frame?.querySelector('.windows-client-frame__workspace')
    const mutationObserver = workspace ? new MutationObserver(updatePosition) : null
    if (workspace && mutationObserver) mutationObserver.observe(workspace, { childList: true })

    updateVisibility()
    updatePosition()
    scrollContainer.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)
    return () => {
      resizeObserver.disconnect()
      mutationObserver?.disconnect()
      scrollContainer.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [])

  if (!visible) return null

  return <button type="button" className="client-back-to-top" style={{ right: `${rightOffset}px` }} onClick={() => document.querySelector<HTMLElement>('.windows-client-frame__main')?.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到顶部">
    <ArrowUp size={17} aria-hidden="true" />
    <span>回到顶部</span>
  </button>
}
