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

  return <div className="gift-animation" aria-hidden="true"><div ref={containerRef} className="gift-animation__player" /></div>
}
