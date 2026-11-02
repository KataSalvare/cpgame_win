import { defineConfig } from 'vite'
import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const ANNOTATIONS_FILE = path.resolve(__dirname, 'src/resources/annotations.json')
const MENU_TREE_FILE = path.resolve(__dirname, 'tools/config/menu-tree.json')
const PROTOTYPES_DIR = path.resolve(__dirname, 'src/prototypes')

function isMenuTree(value: unknown): value is Record<string, Array<{ id: string; children: unknown[] }>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every((nodes) => {
    if (!Array.isArray(nodes)) return false
    const seen = new Set<string>()
    const validateNodes = (items: unknown[], depth = 0): boolean => {
      if (depth > 20) return false
      return items.every((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return false
        const node = item as { id?: unknown; children?: unknown }
        if (typeof node.id !== 'string' || !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(node.id) || seen.has(node.id) || !Array.isArray(node.children)) return false
        seen.add(node.id)
        return validateNodes(node.children, depth + 1)
      })
    }
    return validateNodes(nodes)
  })
}

function menuTreeApiPlugin() {
  return {
    name: 'menu-tree-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/menu-tree', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method === 'GET') {
          try {
            const tree = fs.existsSync(MENU_TREE_FILE) ? JSON.parse(fs.readFileSync(MENU_TREE_FILE, 'utf8')) : null
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ tree }))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          let tooLarge = false
          req.on('data', (chunk: Buffer) => {
            if (body.length + chunk.length > 1_000_000) {
              tooLarge = true
              return
            }
            body += chunk.toString()
          })
          req.on('end', () => {
            if (tooLarge) {
              res.statusCode = 413
              res.end(JSON.stringify({ error: 'Menu tree payload is too large' }))
              return
            }
            try {
              const payload = JSON.parse(body) as { tree?: unknown }
              if (!isMenuTree(payload.tree)) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid menu tree' }))
                return
              }
              fs.mkdirSync(path.dirname(MENU_TREE_FILE), { recursive: true })
              fs.writeFileSync(MENU_TREE_FILE, JSON.stringify(payload.tree, null, 2), 'utf8')
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ success: true }))
            } catch (error) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}

function specApiPlugin() {
  return {
    name: 'spec-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/spec', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const dirName = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''))
        if (!/^[a-zA-Z0-9_-]+$/.test(dirName)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid prototype name' }))
          return
        }
        const filePath = path.resolve(PROTOTYPES_DIR, dirName, 'spec.md')
        if (!filePath.startsWith(`${PROTOTYPES_DIR}${path.sep}`) || !fs.existsSync(filePath)) {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Spec not found' }))
          return
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ content: fs.readFileSync(filePath, 'utf8') }))
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const data = JSON.parse(body) as { content?: unknown }
              if (typeof data.content !== 'string') {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'content must be a string' }))
                return
              }
              fs.writeFileSync(filePath, data.content, 'utf8')
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ success: true }))
            } catch (error) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
            }
          })
          return
        }

        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        next()
      })
    },
  }
}

// 提供标注数据的本地文件读写接口，替代 localStorage
function annotationsPlugin() {
  return {
    name: 'annotations-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/annotations', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.method === 'GET') {
          try {
            if (fs.existsSync(ANNOTATIONS_FILE)) {
              res.setHeader('Content-Type', 'application/json')
              res.end(fs.readFileSync(ANNOTATIONS_FILE, 'utf8'))
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ annotations: [], categories: [] }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              fs.mkdirSync(path.dirname(ANNOTATIONS_FILE), { recursive: true })
              fs.writeFileSync(ANNOTATIONS_FILE, JSON.stringify(data, null, 2), 'utf8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
            }
          })
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), annotationsPlugin(), menuTreeApiPlugin(), specApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 1045,
    strictPort: true,
    watch: {
      // 批注保存会直接写入该文件，忽略监听以避免开发时整页刷新
      ignored: ['**/src/resources/annotations.json', '**/tools/config/menu-tree.json'],
    },    
  },
  preview: {
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tools': path.resolve(__dirname, './tools'),
    },
  },
})
