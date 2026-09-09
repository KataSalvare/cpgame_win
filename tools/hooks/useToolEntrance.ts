import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP)

interface ToolEntranceOptions {
  x?: number
  y?: number
  scale?: number
  duration?: number
}

/** Runs a scoped, reduced-motion-aware entrance animation for tool chrome. */
export function useToolEntrance(
  scope: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>,
  active: boolean,
  { x = 0, y = 6, scale = 0.98, duration = 0.22 }: ToolEntranceOptions = {},
) {
  useGSAP(() => {
    const element = target.current
    if (!active || !element) return

    const media = gsap.matchMedia()
    media.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
      const reduceMotion = Boolean(context.conditions?.reduceMotion)
      gsap.fromTo(
        element,
        { autoAlpha: 0, x, y, scale },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: reduceMotion ? 0 : duration,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
      )
    })

    return () => media.revert()
  }, { scope, dependencies: [active], revertOnUpdate: true })
}
