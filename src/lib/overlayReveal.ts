// 弹窗展开契约：原型在弹窗/浮层所在组件注册 overlayId 对应的展开方式，
// 原型浏览工具在批注定位时按 overlayId 调用，把被标注的弹窗恢复到标注时的状态。

export interface OverlayRevealContext {
  // 批注记录的元素选择器，供需要在多个状态间判断的展开逻辑使用
  selector?: string
}

export type OverlayRevealHandler = (context: OverlayRevealContext) => void | Promise<void>

export interface OverlayRevealOptions {
  // 旧批注没有记录 overlayId 时，只有元素选择器包含任一标记才会尝试该展开方式
  hints?: string[]
}

interface OverlayRevealEntry {
  handler: OverlayRevealHandler
  hints: string[]
}

declare global {
  interface Window {
    __prototypeOverlayReveal?: Map<string, OverlayRevealEntry>
  }
}

function getRegistry(): Map<string, OverlayRevealEntry> {
  if (typeof window === 'undefined') return new Map()
  window.__prototypeOverlayReveal ??= new Map()
  return window.__prototypeOverlayReveal
}

// 注册展开方式，返回取消注册函数（通常在组件的 useEffect 中调用）
export function registerOverlayReveal(
  overlayId: string,
  handler: OverlayRevealHandler,
  options: OverlayRevealOptions = {}
): () => void {
  const registry = getRegistry()
  registry.set(overlayId, { handler, hints: options.hints ?? [] })
  return () => {
    if (registry.get(overlayId)?.handler === handler) registry.delete(overlayId)
  }
}

export function getRegisteredOverlays(): Array<{ overlayId: string; hints: string[] }> {
  return Array.from(getRegistry(), ([overlayId, entry]) => ({ overlayId, hints: entry.hints }))
}

// 调用指定 overlayId 的展开方式；未注册时返回 false
export async function revealOverlay(overlayId: string, context: OverlayRevealContext = {}): Promise<boolean> {
  const entry = getRegistry().get(overlayId)
  if (!entry) return false
  await entry.handler(context)
  return true
}
