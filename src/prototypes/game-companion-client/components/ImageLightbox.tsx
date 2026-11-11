import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  images: string[]
  label: string
  overlayId?: string
  children: (openAt: (index: number) => void) => ReactNode
}

export function ImageLightbox({ images, label, overlayId = 'image-lightbox', children }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const openAt = (index: number) => setActiveIndex(index)

  useEffect(() => {
    if (activeIndex === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowLeft') setActiveIndex((index) => index === null ? null : (index - 1 + images.length) % images.length)
      if (event.key === 'ArrowRight') setActiveIndex((index) => index === null ? null : (index + 1) % images.length)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, images.length])

  return <div className="image-lightbox-host">
    {children(openAt)}
    {activeIndex !== null && images.length > 0 && <div className="image-lightbox" data-overlay={overlayId} onClick={(event) => { if (event.target === event.currentTarget) setActiveIndex(null) }}>
      <button type="button" className="image-lightbox__close" aria-label="关闭大图" onClick={() => setActiveIndex(null)}><X size={20} /></button>
      <div className="image-lightbox__content" role="dialog" aria-modal="true" aria-label={label}>
        <div className="image-lightbox__stage"><img src={images[activeIndex]} alt={`${label} ${activeIndex + 1}`} /></div>
        <div className="image-lightbox__thumbnails" role="group" aria-label={`${label}缩略图`}>
          {images.map((image, index) => <button type="button" key={`${index}-${image.slice(-32)}`} aria-label={`查看第 ${index + 1} 张图片`} aria-pressed={index === activeIndex} className={index === activeIndex ? 'is-selected' : ''} onClick={() => setActiveIndex(index)}><img src={image} alt="" /></button>)}
        </div>
      </div>
    </div>}
  </div>
}
