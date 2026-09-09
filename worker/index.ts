import defaultAnnotations from '../src/resources/annotations.json'

const ANNOTATIONS_KEY = 'annotations'

interface AnnotationsData {
  annotations: unknown[]
  categories: unknown[]
}

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

    return env.ASSETS.fetch(request)
  },
}
