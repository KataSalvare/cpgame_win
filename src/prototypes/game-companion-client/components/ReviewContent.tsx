import { useEffect, useRef, useState } from 'react'

const REVIEW_CONTENT_LIMIT = 100

export function ReviewContent({ content }: { content: string }) {
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const visibleContent = content.length > REVIEW_CONTENT_LIMIT ? `${content.slice(0, REVIEW_CONTENT_LIMIT - 1)}…` : content
  const [canExpand, setCanExpand] = useState(false)

  useEffect(() => {
    const paragraph = paragraphRef.current
    if (!paragraph) return
    const measureOverflow = () => {
      const clone = paragraph.cloneNode(true) as HTMLParagraphElement
      const style = window.getComputedStyle(paragraph)
      const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.6
      clone.classList.add('is-expanded')
      clone.style.cssText += `;position:absolute;visibility:hidden;display:block;width:${paragraph.clientWidth}px;height:auto;max-height:none;overflow:visible;-webkit-line-clamp:unset;`
      paragraph.parentElement?.appendChild(clone)
      setCanExpand(clone.getBoundingClientRect().height > lineHeight * 3 + 1)
      clone.remove()
    }
    const frame = window.requestAnimationFrame(measureOverflow)
    const observer = new ResizeObserver(measureOverflow)
    observer.observe(paragraph)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [visibleContent])

  return <>
    <p ref={paragraphRef} className={`review-item__content${expanded ? ' is-expanded' : ''}`}>{visibleContent}</p>
    {canExpand && <button type="button" className="review-item__expand" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? '收起' : '展开'}</button>}
  </>
}
