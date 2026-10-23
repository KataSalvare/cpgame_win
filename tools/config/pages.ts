import { lazy } from 'react'
import type React from 'react'
import type { PrototypePreviewProps } from '@/prototypes/previewState'

export type PageCategory = 'frontend' | 'admin'

export interface PageStateOption {
  id: string
  label: string
}

export interface PageItem {
  path: string
  label: string
  component: React.ComponentType<PrototypePreviewProps>
  category: PageCategory
  dirName: string
  states: readonly PageStateOption[]
}

type PrototypeModule = { default?: React.ComponentType<PrototypePreviewProps> }
type PrototypeLoader = () => Promise<PrototypeModule>

const allModules = import.meta.glob<PrototypeModule>('../../src/prototypes/*/index.tsx')

const frontendModules: Record<string, PrototypeLoader> = {}
const adminModules: Record<string, PrototypeLoader> = {}

Object.entries(allModules).forEach(([path, mod]) => {
  const match = path.match(/\.\.\/\.\.\/src\/prototypes\/([^/]+)\//)
  if (match) {
    const dirName = match[1]
    if (dirName.includes('admin')) {
      adminModules[path] = mod
    } else {
      frontendModules[path] = mod
    }
  }
})

const demoPageStates: readonly PageStateOption[] = [
  { id: 'normal', label: '正常' },
  { id: 'loading', label: '加载中' },
  { id: 'empty', label: '空数据' },
  { id: 'error', label: '异常' },
]

const frontendPageConfig: Record<string, { path: string; label: string; states: readonly PageStateOption[] }> = {
  'DEMO-ecommerce-detail': { path: '/demo/ecommerce-detail', label: 'DEMO 电商详情页', states: demoPageStates },
  'DEMO-game-companion-home': { path: '/demo/game-companion-home', label: 'DEMO 陪玩平台主页', states: demoPageStates },
  'DEMO-sports-health-home': { path: '/demo/sports-health', label: 'DEMO 运动健康首页', states: demoPageStates },
  'DEMO-blockchain-wallet': { path: '/demo/blockchain-wallet', label: 'DEMO 区块链钱包', states: demoPageStates },
}

const adminPageConfig: Record<string, { path: string; label: string; states: readonly PageStateOption[] }> = {
  'DEMO-admin-saas-home': { path: '/demo/admin/saas-home', label: 'DEMO SaaS 平台首页', states: demoPageStates },
  'DEMO-admin-user-management': { path: '/demo/admin/user-management', label: 'DEMO 用户管理', states: demoPageStates },
  'DEMO-admin-analytics': { path: '/demo/admin/analytics', label: 'DEMO 运营数据看板', states: demoPageStates },
}

export const getDefaultComponent = (mod: unknown): React.ComponentType<PrototypePreviewProps> => {
  const moduleWithDefault = mod as { default?: React.ComponentType<PrototypePreviewProps> }
  return moduleWithDefault?.default || (() => null)
}

const getLazyComponent = (loader: PrototypeLoader): React.ComponentType<PrototypePreviewProps> => lazy(async () => {
  const mod = await loader()
  return { default: getDefaultComponent(mod) }
})

export const generatePages = (): PageItem[] => {
  const pages: PageItem[] = []

  Object.entries(frontendModules).forEach(([filePath, loader]) => {
    const match = filePath.match(/\.\.\/\.\.\/src\/prototypes\/([^/]+)\//)
    if (match) {
      const dirName = match[1]
      const config = frontendPageConfig[dirName]
      if (config) {
        pages.push({
          path: config.path,
          label: config.label,
          component: getLazyComponent(loader),
          category: 'frontend',
          dirName,
          states: config.states,
        })
      }
    }
  })

  Object.entries(adminModules).forEach(([filePath, loader]) => {
    const match = filePath.match(/\.\.\/\.\.\/src\/prototypes\/([^/]+)\//)
    if (match) {
      const dirName = match[1]
      const config = adminPageConfig[dirName]
      if (config) {
        pages.push({
          path: config.path,
          label: config.label,
          component: getLazyComponent(loader),
          category: 'admin',
          dirName,
          states: config.states,
        })
      }
    }
  })

  return pages
}

export const pages = generatePages()
