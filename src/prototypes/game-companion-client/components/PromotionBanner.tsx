import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { banners } from '../data/mockData'

export function PromotionBanner() {
  const [bannerIndex, setBannerIndex] = useState(0)
  const currentBanner = banners[bannerIndex]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setBannerIndex((index) => (index + 1) % banners.length), 7000)
    return () => window.clearInterval(timer)
  }, [])

  const moveBanner = (direction: -1 | 1) => {
    setBannerIndex((index) => (index + direction + banners.length) % banners.length)
  }

  return <section className="home-banner" aria-label="平台推荐 Banner">
    <div className="home-banner__content" aria-live="polite">
      <span className="home-banner__eyebrow"><Sparkles size={14} />{currentBanner.eyebrow}</span>
      <h2>{currentBanner.title}</h2>
      <p>{currentBanner.description}</p>
      <span className="home-banner__label">{currentBanner.actionLabel}</span>
    </div>
    <div className="home-banner__controls">
      <button type="button" className="client-icon-button" aria-label="上一张 Banner" onClick={() => moveBanner(-1)}><ChevronLeft size={18} /></button>
      <div className="home-banner__dots" aria-label="选择 Banner">
        {banners.map((banner, index) => <button key={banner.id} type="button" aria-label={`第 ${index + 1} 张`} aria-current={index === bannerIndex} className={index === bannerIndex ? 'is-active' : ''} onClick={() => setBannerIndex(index)} />)}
      </div>
      <button type="button" className="client-icon-button" aria-label="下一张 Banner" onClick={() => moveBanner(1)}><ChevronRight size={18} /></button>
    </div>
  </section>
}
