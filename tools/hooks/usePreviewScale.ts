import { useEffect, useRef, useState } from 'react'

export const DESKTOP_PREVIEW_WIDTH = 1920
export const DESKTOP_PREVIEW_HEIGHT = 1080

// 测量工作台可用空间；原型布局尺寸不随显示比例改变。
export function usePreviewScale() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setScale(Math.min(1, width / DESKTOP_PREVIEW_WIDTH, height / DESKTOP_PREVIEW_HEIGHT))
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return { stageRef, scale }
}
