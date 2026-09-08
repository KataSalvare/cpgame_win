import { defineConfig } from 'vite'
import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const ANNOTATIONS_FILE = path.resolve(__dirname, 'src/resources/annotations.json')

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
  plugins: [react(), tailwindcss(), annotationsPlugin()],
  server: {
    port: 1025,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tools': path.resolve(__dirname, './tools'),
    },
  },
})
