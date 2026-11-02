import defaultAnnotations from '../src/resources/annotations.json'
import defaultMenuTree from '../tools/config/menu-tree.json'
import { mergeMenuTreeWithDefaults } from '../tools/lib/menuTree'

const ANNOTATIONS_KEY = 'annotations'
const MENU_TREE_KEY = 'tool-menu-tree'
const SPEC_KEY_PREFIX = 'spec:'
const EDITABLE_SPECS = new Set<string>()

interface AnnotationsData {
  annotations: unknown[]
  categories: unknown[]
}

type MenuNode = { id: string; children: MenuNode[]; label?: string }
type MenuTree = Record<string, MenuNode[]>

interface AnnotationsKv {
  get(key: string, type: 'json'): Promise<unknown | null>
  put(key: string, value: string): Promise<void>
}

interface WorkerEnv {
  ANNOTATIONS_KV: AnnotationsKv
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAnnotationsData(value: unknown): value is AnnotationsData {
  return (
    isRecord(value) &&
    Array.isArray(value.annotations) &&
    Array.isArray(value.categories)
  )
}

function isMenuTree(value: unknown): value is MenuTree {
  if (!isRecord(value)) return false
  return Object.values(value).every((nodes) => {
    if (!Array.isArray(nodes)) return false
    const seen = new Set<string>()
    const validateNodes = (items: unknown[], depth = 0): boolean => {
      if (depth > 20) return false
      return items.every((item) => {
        if (!isRecord(item) || typeof item.id !== 'string' || !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(item.id)) return false
        if (seen.has(item.id) || !Array.isArray(item.children)) return false
        if (item.label !== undefined && typeof item.label !== 'string') return false
        seen.add(item.id)
        return validateNodes(item.children, depth + 1)
      })
    }
    return validateNodes(nodes)
  })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

async function handleAnnotations(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method === 'GET') {
    const stored = await env.ANNOTATIONS_KV.get(ANNOTATIONS_KEY, 'json')

    if (stored === null) {
      return jsonResponse(defaultAnnotations)
    }

    if (!isAnnotationsData(stored)) {
      return jsonResponse({ error: 'Stored annotations data is invalid' }, 500)
    }

    return jsonResponse(stored)
  }

  if (request.method === 'POST') {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Request body must be valid JSON' }, 400)
    }

    if (!isAnnotationsData(body)) {
      return jsonResponse(
        { error: 'Request body must contain annotations and categories arrays' },
        400,
      )
    }

    await env.ANNOTATIONS_KV.put(ANNOTATIONS_KEY, JSON.stringify(body))
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}

async function handleMenuTree(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method === 'GET') {
    const stored = await env.ANNOTATIONS_KV.get(MENU_TREE_KEY, 'json')
    if (stored === null) return jsonResponse({ tree: defaultMenuTree })
    if (!isMenuTree(stored)) return jsonResponse({ error: 'Stored menu tree is invalid' }, 500)
    return jsonResponse({ tree: mergeMenuTreeWithDefaults(stored, defaultMenuTree as MenuTree) })
  }

  if (request.method === 'POST') {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Request body must be valid JSON' }, 400)
    }
    if (!isRecord(body) || !isMenuTree(body.tree)) {
      return jsonResponse({ error: 'Request body must contain a valid menu tree' }, 400)
    }
    const tree = mergeMenuTreeWithDefaults(body.tree, defaultMenuTree as MenuTree)
    await env.ANNOTATIONS_KV.put(MENU_TREE_KEY, JSON.stringify(tree))
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}

async function handleSpec(request: Request, env: WorkerEnv, dirName: string): Promise<Response> {
  if (!EDITABLE_SPECS.has(dirName)) return jsonResponse({ error: 'Spec not found' }, 404)
  const key = `${SPEC_KEY_PREFIX}${dirName}`

  if (request.method === 'GET') {
    const stored = await env.ANNOTATIONS_KV.get(key, 'json')
    if (stored === null) return jsonResponse({ content: null })
    if (!isRecord(stored) || typeof stored.content !== 'string') {
      return jsonResponse({ error: 'Stored spec is invalid' }, 500)
    }
    return jsonResponse({ content: stored.content })
  }

  if (request.method === 'POST') {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Request body must be valid JSON' }, 400)
    }
    if (!isRecord(body) || typeof body.content !== 'string') {
      return jsonResponse({ error: 'Request body must contain a content string' }, 400)
    }
    await env.ANNOTATIONS_KV.put(key, JSON.stringify({ content: body.content }))
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const pathname = new URL(request.url).pathname

    if (pathname === '/api/annotations' || pathname === '/api/annotations/') {
      try {
        return await handleAnnotations(request, env)
      } catch (error) {
        console.error('Annotations API error:', error)
        return jsonResponse({ error: 'Annotations service unavailable' }, 500)
      }
    }

    if (pathname === '/api/menu-tree' || pathname === '/api/menu-tree/') {
      try {
        return await handleMenuTree(request, env)
      } catch (error) {
        console.error('Menu tree API error:', error)
        return jsonResponse({ error: 'Menu tree service unavailable' }, 500)
      }
    }

    const specMatch = pathname.match(/^\/api\/spec\/([^/]+)\/?$/)
    if (specMatch) {
      try {
        return await handleSpec(request, env, decodeURIComponent(specMatch[1]))
      } catch (error) {
        console.error('Spec API error:', error)
        return jsonResponse({ error: 'Spec service unavailable' }, 500)
      }
    }

    return env.ASSETS.fetch(request)
  },
}
