export interface MenuNode {
  id: string
  label?: string
  children: MenuNode[]
}

export type MenuTree = Record<string, MenuNode[]>

const STORAGE_KEY = 'prototype-sidebar-menu-tree-v3'
const FILE_API = '/api/menu-tree'

const makeFlatTree = (ids: string[]): MenuNode[] => ids.map(id => ({ id, children: [] }))

const sanitizeNodes = (value: unknown, allowed: Set<string>): MenuNode[] => {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const visit = (items: unknown[]): MenuNode[] => items.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const candidate = item as { id?: unknown; label?: unknown; children?: unknown }
    if (typeof candidate.id !== 'string' || !allowed.has(candidate.id) || seen.has(candidate.id)) return []
    seen.add(candidate.id)
    const label = typeof candidate.label === 'string' && candidate.label.trim() ? candidate.label.trim() : undefined
    return [{ id: candidate.id, ...(label ? { label } : {}), children: visit(Array.isArray(candidate.children) ? candidate.children : []) }]
  })
  return visit(value)
}

const restoreMenuTree = (saved: unknown, idsByCategory: Record<string, string[]>): MenuTree => {
  const defaults = Object.fromEntries(Object.entries(idsByCategory).map(([category, ids]) => [category, makeFlatTree(ids)]))
  if (!saved || typeof saved !== 'object') return defaults
  return Object.fromEntries(Object.entries(idsByCategory).map(([category, ids]) => {
    const allowed = new Set(ids)
    const restored = sanitizeNodes((saved as Record<string, unknown>)[category], allowed)
    const present = new Set<string>()
    const collect = (nodes: MenuNode[]) => nodes.forEach(node => { present.add(node.id); collect(node.children) })
    collect(restored)
    return [category, [...restored, ...ids.filter(id => !present.has(id)).map(id => ({ id, children: [] }))]]
  }))
}

export const loadMenuTree = (idsByCategory: Record<string, string[]>): MenuTree => {
  try {
    return restoreMenuTree(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'), idsByCategory)
  } catch {
    return restoreMenuTree(null, idsByCategory)
  }
}

export const loadMenuTreeFromFile = async (idsByCategory: Record<string, string[]>): Promise<MenuTree> => {
  const response = await fetch(FILE_API)
  if (!response.ok) throw new Error(`菜单文件读取失败：${response.status}`)
  const payload = await response.json() as { tree?: unknown }
  if (!Object.hasOwn(payload, 'tree')) throw new Error('菜单文件接口未返回有效数据')
  const tree = payload.tree ? restoreMenuTree(payload.tree, idsByCategory) : loadMenuTree(idsByCategory)
  if (!payload.tree) await saveMenuTree(tree)
  return tree
}

let saveQueue: Promise<void> = Promise.resolve()

export const saveMenuTree = (tree: MenuTree): Promise<void> => {
  const serialized = JSON.stringify(tree)
  saveQueue = saveQueue.catch(() => undefined).then(async () => {
    const response = await fetch(FILE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tree }),
    })
    if (!response.ok) throw new Error(`菜单文件保存失败：${response.status}`)
    const result = await response.json() as { success?: unknown }
    if (result.success !== true) throw new Error('菜单文件接口未确认保存结果')
    try { localStorage.setItem(STORAGE_KEY, serialized) } catch { /* The local file remains the source of truth. */ }
  })
  return saveQueue
}

const removeNode = (nodes: MenuNode[], id: string): { nodes: MenuNode[]; removed?: MenuNode } => {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (node.id === id) return { nodes: nodes.filter(item => item.id !== id), removed: node }
    const nested = removeNode(node.children, id)
    if (nested.removed) return { nodes: nodes.map(item => item.id === node.id ? { ...node, children: nested.nodes } : item), removed: nested.removed }
  }
  return { nodes }
}

const contains = (node: MenuNode, id: string): boolean => node.id === id || node.children.some(child => contains(child, id))

export const moveMenuNode = (tree: MenuTree, category: string, draggedId: string, targetId: string, placement: 'before' | 'after' | 'inside'): MenuTree => {
  const current = tree[category] ?? []
  const { nodes, removed } = removeNode(current, draggedId)
  if (!removed || contains(removed, targetId)) return tree
  const insert = (siblings: MenuNode[]): { nodes: MenuNode[]; inserted: boolean } => {
    if (placement === 'inside') {
      const index = siblings.findIndex(node => node.id === targetId)
      if (index >= 0) return { nodes: siblings.map((node, i) => i === index ? { ...node, children: [...node.children, removed] } : node), inserted: true }
    }
    for (let index = 0; index < siblings.length; index += 1) {
      if (siblings[index].id === targetId) {
        const offset = placement === 'before' ? 0 : 1
        return { nodes: [...siblings.slice(0, index + offset), removed, ...siblings.slice(index + offset)], inserted: true }
      }
      const nested = insert(siblings[index].children)
      if (nested.inserted) return { nodes: siblings.map((node, i) => i === index ? { ...node, children: nested.nodes } : node), inserted: true }
    }
    return { nodes: siblings, inserted: false }
  }
  const result = insert(nodes)
  if (!result.inserted) return tree

  const allowed = new Set<string>()
  const collectIds = (items: MenuNode[]) => items.forEach(item => { allowed.add(item.id); collectIds(item.children) })
  collectIds(current)
  return { ...tree, [category]: sanitizeNodes(result.nodes, allowed) }
}

export const renameMenuNode = (tree: MenuTree, category: string, id: string, label: string): MenuTree => {
  const rename = (nodes: MenuNode[]): MenuNode[] => nodes.map(node => node.id === id
    ? { ...node, label: label.trim() || undefined }
    : { ...node, children: rename(node.children) })
  return { ...tree, [category]: rename(tree[category] ?? []) }
}
