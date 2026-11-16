import { useEffect, useEffectEvent, useRef } from 'react'
import { Parser, Player } from 'svgaplayerweb'

const animationUrl = new URL('../assets/gift-sports-car.svga', import.meta.url).href

export function GiftAnimation({ onFinished }: { onFinished: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const finish = useEffectEvent(onFinished)

  useEffect(() => {
    if (!containerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    let active = true
    const player = new Player(containerRef.current)
    const parser = new Parser()
    player.loops = 1
    player.clearsAfterStop = true
    player.setContentMode('AspectFit')
    player.onFinished(() => { if (active) finish() })
    parser.load(animationUrl, (video) => {
      if (!active) return
      player.setVideoItem(video)
      player.startAnimation()
    }, () => { if (active) finish() })
    return () => { active = false; player.stopAnimation() }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish() }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  return <div className="gift-animation" onClick={onFinished} role="presentation">
    <div ref={containerRef} className="gift-animation__player" aria-hidden="true" />
    <button type="button" className="gift-animation__skip" onClick={(event) => { event.stopPropagation(); onFinished() }}>跳过</button>
  </div>
}
