import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, loadConfigFromFile } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'html-export')
const tempDir = path.join(root, '.tmp-client-html-export')
const pagesSource = fs.readFileSync(path.join(root, 'tools/config/pages.ts'), 'utf8')
const routePattern = /\{\s*path:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'\s*,\s*entryView:\s*'([^']+)'(?:,\s*defaultHash:\s*'([^']+)')?/g
const routes = [...pagesSource.matchAll(routePattern)].map((match) => ({ path: match[1], label: match[2], entryView: match[3], defaultHash: match[4] }))

if (!routes.length) throw new Error('没有从 tools/config/pages.ts 找到客户端路由。')

fs.rmSync(tempDir, { recursive: true, force: true })
fs.mkdirSync(tempDir, { recursive: true })
fs.rmSync(outputDir, { recursive: true, force: true })
fs.mkdirSync(outputDir, { recursive: true })

const entryPath = path.join(tempDir, 'entry.tsx')
const stylePath = path.join(tempDir, 'entry.css')
const configPath = path.join(tempDir, 'vite.config.mjs')
fs.writeFileSync(entryPath, `
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import GameCompanionClient from ${JSON.stringify(path.join(root, 'src/prototypes/game-companion-client/index.tsx'))}
import './entry.css'
const { entryView, defaultHash } = window.__CLIENT_EXPORT_ROUTE__
if (defaultHash && !window.location.hash) window.location.hash = defaultHash
document.documentElement.dataset.prototypePalette = 'grayscale'
function ExportClient() {
  const location = useLocation()
  const [activePath, setActivePath] = React.useState(location.pathname)
  React.useLayoutEffect(() => {
    if (location.pathname !== activePath) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      setActivePath(location.pathname)
    }
  }, [location.pathname, activePath])
  if (location.pathname !== activePath) return null
  const view = location.pathname === '/game-companion-login' ? 'login' : location.pathname === '/game-companion-client' ? 'home' : entryView
  return React.createElement(GameCompanionClient, { key: activePath, entryView: view })
}
createRoot(document.getElementById('root')).render(React.createElement(MemoryRouter, null, React.createElement(ExportClient)))
`)
fs.writeFileSync(stylePath, `
@import "tailwindcss";
@source "${path.join(root, 'src/prototypes/game-companion-client')}";
@source "${path.join(root, 'src/components/WindowsClient')}";
@source "${path.join(root, 'src/themes/grayscale-prototype/components')}";
@source "${path.join(root, 'src/prototypes/previewState.ts')}";
@source "${path.join(root, 'src/lib')}";
@import "${path.join(root, 'src/themes/grayscale-prototype/palette.css')}";
@import "@fontsource-variable/geist";
:root { --prototype-canvas:#F3F4F6; --prototype-surface:#fff; --prototype-border:#E5E7EB; --prototype-border-strong:#D1D5DB; --prototype-text:#1F2937; --prototype-text-secondary:#374151; --prototype-text-muted:#6B7280; --prototype-text-subtle:#9CA3AF; --prototype-primary:#374151; --prototype-primary-hover:#1F2937; --prototype-on-primary:#fff; }
html,body,#root { width:100%; min-width:1280px; min-height:100%; height:100%; margin:0; }
`)
fs.writeFileSync(configPath, `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
export default defineConfig({ root: ${JSON.stringify(tempDir)}, configFile:false, plugins:[react(),tailwindcss()], define:{ 'import.meta.url':'window.location.href', 'process.env.NODE_ENV':JSON.stringify('production') }, resolve:{ alias:{ '@':${JSON.stringify(path.join(root,'src'))} } }, build:{ outDir:${JSON.stringify(path.join(tempDir,'build'))}, emptyOutDir:true, assetsInlineLimit:20_000_000, cssCodeSplit:false, lib:{ entry:${JSON.stringify(entryPath)}, name:'ClientExport', formats:['iife'], fileName:()=> 'bundle.js' }, rollupOptions:{ output:{ inlineDynamicImports:true } } } })
`)

try {
  await build({ configFile: configPath })
  const bundlePath = path.join(tempDir, 'build/bundle.js')
  const bundle = fs.readFileSync(bundlePath, 'utf8')
  const cssFile = fs.readdirSync(path.join(tempDir, 'build')).find((file) => file.endsWith('.css'))
  if (!cssFile) throw new Error('构建产物中没有找到样式文件。')
  const css = fs.readFileSync(path.join(tempDir, 'build', cssFile), 'utf8')
  for (const route of routes) {
    const filename = `${route.path.slice(1)}.html`
    const routeJson = JSON.stringify({ entryView: route.entryView, defaultHash: route.defaultHash ?? '' }).replaceAll('<', '\\u003c')
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${route.label}</title><style>${css}</style></head><body><div id="root"></div><script>window.__CLIENT_EXPORT_ROUTE__=${routeJson};window.addEventListener('error',e=>{document.getElementById('root').innerHTML='<pre style="padding:24px;color:#b91c1c;white-space:pre-wrap"></pre>';document.querySelector('#root pre').textContent=e.message+'\\n'+(e.error?.stack||'')});window.addEventListener('unhandledrejection',e=>{document.getElementById('root').innerHTML='<pre style="padding:24px;color:#b91c1c;white-space:pre-wrap"></pre>';document.querySelector('#root pre').textContent=String(e.reason?.stack||e.reason)})</script><script>${bundle}</script></body></html>`
    fs.writeFileSync(path.join(outputDir, filename), html)
  }
  console.log(`导出完成：${routes.length} 个单文件 HTML -> ${path.relative(root, outputDir)}`)
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
