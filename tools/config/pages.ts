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
  prdPath: string
  entryView?: string
  defaultHash?: string
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

const loginPageStates: readonly PageStateOption[] = [
  { id: 'normal', label: '正常' },
  { id: 'loading', label: '加载中' },
  { id: 'error', label: '异常' },
]

const identityVerificationPageStates: readonly PageStateOption[] = [
  { id: 'normal', label: '正常' },
]

type PageConfig = { path: string; label: string; states: readonly PageStateOption[]; entryView?: string; defaultHash?: string }

const frontendPageConfig: Record<string, PageConfig | PageConfig[]> = {
  'game-companion-client': [
    { path: '/game-companion-login', label: '登录', entryView: 'login', states: loginPageStates },
    { path: '/game-companion-identity-verification', label: '实名认证', entryView: 'identity-verification', states: identityVerificationPageStates },
    { path: '/game-companion-search', label: '搜索', entryView: 'global-search', defaultHash: '#page=home&tool=global-search', states: demoPageStates },
    { path: '/game-companion-client', label: '首页', entryView: 'home', states: demoPageStates },
    { path: '/game-companion-quick-match', label: '一键匹配', entryView: 'quick-match', defaultHash: '#page=home&tool=quick-match', states: demoPageStates },
    { path: '/game-companion-match-in-progress', label: '匹配中', entryView: 'quick-match-in-progress', defaultHash: '#page=home&tool=quick-match-in-progress', states: demoPageStates },
    { path: '/game-companion-talents', label: '大神', entryView: 'talents', states: demoPageStates },
    { path: '/game-companion-club-detail', label: '俱乐部详情', entryView: 'club-detail', states: demoPageStates },
    { path: '/game-companion-companion-detail', label: '陪玩详情', entryView: 'companion-detail', defaultHash: '#page=club-detail&club=club-001&companion=companion-001', states: demoPageStates },
    { path: '/game-companion-checkout', label: '下单结算', entryView: 'checkout', states: demoPageStates },
    { path: '/game-companion-profile', label: '个人中心', entryView: 'profile', states: demoPageStates },
    { path: '/game-companion-profile-wealth', label: '财富等级', entryView: 'profile-wealth', defaultHash: '#page=profile&section=wealth', states: demoPageStates },
    { path: '/game-companion-profile-visits', label: '我的访问', entryView: 'profile-visits', defaultHash: '#page=profile&section=visits', states: demoPageStates },
    { path: '/game-companion-profile-social', label: '我的社交', entryView: 'profile-social', defaultHash: '#page=profile&section=favorites', states: demoPageStates },
    { path: '/game-companion-profile-onboarding', label: '陪玩入驻', entryView: 'profile-onboarding', defaultHash: '#page=profile&section=onboarding&onboarding=companion', states: demoPageStates },
    { path: '/game-companion-profile-onboarding-center', label: '入驻中心', entryView: 'profile-onboarding-center', defaultHash: '#page=profile&section=onboarding', states: demoPageStates },
    { path: '/game-companion-profile-club-onboarding', label: '俱乐部入驻', entryView: 'profile-club-onboarding', defaultHash: '#page=profile&section=onboarding&onboarding=club', states: demoPageStates },
    { path: '/game-companion-profile-clubs', label: '我的俱乐部', entryView: 'profile-clubs', defaultHash: '#page=profile&section=clubs', states: demoPageStates },
    { path: '/game-companion-profile-cancel-account', label: '注销账号', entryView: 'profile-cancel-account', defaultHash: '#page=profile&section=cancel-account', states: demoPageStates },
    { path: '/game-companion-club-support', label: '俱乐部客服', entryView: 'club-support', defaultHash: '#page=messages&support=club', states: demoPageStates },
    { path: '/game-companion-platform-support', label: '平台客服', entryView: 'platform-support', defaultHash: '#page=home&support=platform', states: demoPageStates },
    { path: '/game-companion-system-settings', label: '系统设置', entryView: 'system-settings', states: demoPageStates },
    { path: '/game-companion-help-center', label: '帮助中心', entryView: 'help-center', defaultHash: '#page=home&tool=help-center', states: demoPageStates },
    { path: '/game-companion-screen-recording', label: '屏幕录制', entryView: 'screen-recording', defaultHash: '#page=home&tool=screen-recording', states: demoPageStates },
    { path: '/game-companion-client-notifications', label: '客户端通知', entryView: 'client-notifications', defaultHash: '#page=home&tool=client-notifications', states: demoPageStates },
    { path: '/game-companion-close-app', label: '关闭应用', entryView: 'close-app', defaultHash: '#page=home&tool=close-app', states: demoPageStates },
    { path: '/game-companion-quick-panel', label: '我的快捷面板', entryView: 'quick-panel', defaultHash: '#page=home&tool=quick-panel', states: demoPageStates },
    { path: '/game-companion-wallet', label: '我的钱包', entryView: 'wallet', states: demoPageStates },
    { path: '/game-companion-withdraw', label: '糖豆提现', entryView: 'bean-withdraw', defaultHash: '#page=wallet&panel=bean-withdraw', states: demoPageStates },
    { path: '/game-companion-bean-exchange', label: '糖豆兑换', entryView: 'bean-exchange', defaultHash: '#page=wallet&panel=bean-exchange', states: demoPageStates },
    { path: '/game-companion-recharge', label: '购买金豆', entryView: 'wallet-recharge', states: demoPageStates },
    { path: '/game-companion-coupons', label: '优惠券', entryView: 'coupons', states: demoPageStates },
    { path: '/game-companion-club-cards', label: '俱乐部尊享卡', entryView: 'club-cards', states: demoPageStates },
    { path: '/game-companion-my-cards', label: '我的尊享卡', entryView: 'my-cards', states: demoPageStates },
    { path: '/game-companion-orders', label: '我的订单', entryView: 'orders', states: demoPageStates },
    { path: '/game-companion-order-detail', label: '我的订单详情', entryView: 'order-detail', defaultHash: '#page=orders&detail=client&order=GC-20261029-0001', states: demoPageStates },
    { path: '/game-companion-receiving-order-detail', label: '我的接单详情', entryView: 'receiving-order-detail', defaultHash: '#page=orders&detail=receiving&order=CW-1028-100', states: demoPageStates },
    { path: '/game-companion-orders-receiving', label: '我的接单', entryView: 'orders-receiving', defaultHash: '#page=orders&orderTab=receiving', states: demoPageStates },
    { path: '/game-companion-orders-exam-candidate', label: '考生订单', entryView: 'orders-exam-candidate', defaultHash: '#page=orders&orderTab=exam-candidate', states: demoPageStates },
    { path: '/game-companion-orders-exam-proctor', label: '考官订单', entryView: 'orders-exam-proctor', defaultHash: '#page=orders&orderTab=exam-proctor', states: demoPageStates },
    { path: '/game-companion-messages', label: '消息', entryView: 'messages', states: demoPageStates },
    { path: '/game-companion-user-support', label: '用户视角客服', entryView: 'im-user-support-view', defaultHash: '#page=messages&tool=im-user-support-view', states: demoPageStates },
    { path: '/game-companion-user-messages', label: '用户视角消息', entryView: 'im-user-message-view', defaultHash: '#page=messages&tool=im-user-message-view', states: demoPageStates },
    { path: '/game-companion-support-messages', label: '客服视角消息', entryView: 'im-support-view', defaultHash: '#page=messages&tool=im-support-view', states: demoPageStates },
    { path: '/game-companion-companion-messages', label: '陪玩视角消息', entryView: 'im-companion-view', defaultHash: '#page=messages&tool=im-companion-view', states: demoPageStates },
    { path: '/game-companion-group-owner-messages', label: '群主视角群聊', entryView: 'im-group-owner-view', defaultHash: '#page=messages&tool=im-group-owner-view', states: demoPageStates },
    { path: '/game-companion-group-user-messages', label: '用户视角群聊', entryView: 'im-group-user-view', defaultHash: '#page=messages&tool=im-group-user-view', states: demoPageStates },
    { path: '/game-companion-voice-room', label: '我的房间', entryView: 'voice-room', states: demoPageStates },
    { path: '/game-companion-room-minimized', label: '房间最小化', entryView: 'voice-room-minimized', defaultHash: '#page=home&tool=voice-room-minimized', states: demoPageStates },
    { path: '/game-companion-club-voice-room', label: '俱乐部房间', entryView: 'club-voice-room', states: demoPageStates },
    { path: '/game-companion-club-voice-room-user', label: '俱乐部房间-用户视角', entryView: 'club-voice-room-user', defaultHash: '#page=voice-room&voiceFrom=club&voiceView=user', states: demoPageStates },
    { path: '/game-companion-club-voice-room-customer-service', label: '俱乐部房间-客服视角', entryView: 'club-voice-room-customer-service', defaultHash: '#page=voice-room&voiceFrom=club&voiceView=customer-service', states: demoPageStates },
    { path: '/game-companion-woodpecker', label: '啄木鸟', entryView: 'woodpecker', states: demoPageStates },
    { path: '/game-companion-workbench', label: '陪玩工作台', entryView: 'workbench', states: demoPageStates },
    { path: '/game-companion-workbench-matches', label: '匹配请求', entryView: 'workbench-matches', defaultHash: '#page=workbench&workbenchTab=matches', states: demoPageStates },
    { path: '/game-companion-workbench-orders', label: '陪玩订单', entryView: 'workbench-orders', defaultHash: '#page=workbench&workbenchTab=orders', states: demoPageStates },
    { path: '/game-companion-workbench-services', label: '服务管理', entryView: 'workbench-services', defaultHash: '#page=workbench&workbenchTab=services', states: demoPageStates },
    { path: '/game-companion-workbench-apply-service', label: '申请服务', entryView: 'workbench-apply-service', defaultHash: '#page=workbench&workbenchTab=services&applyService=1', states: demoPageStates },
    { path: '/game-companion-announcements', label: '平台公告', entryView: 'announcements', states: demoPageStates },
    { path: '/game-companion-club-announcements', label: '俱乐部公告', entryView: 'club-announcements', defaultHash: '#page=club-detail&club=club-001&panel=club-announcements', states: demoPageStates },
  ],
}

const adminPageConfig: Record<string, { path: string; label: string; states: readonly PageStateOption[] }> = {
  'DEMO-admin-windows-client-components': { path: '/demo/admin/windows-client-components', label: 'DEMO Windows 客户端组件', states: demoPageStates },
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
      const pageConfigs = config ? Array.isArray(config) ? config : [config] : []
      pageConfigs.forEach((pageConfig) => pages.push({
        path: pageConfig.path,
        label: pageConfig.label,
        prdPath: `../../src/docs/page-prds/${pageConfig.path.replace(/^\//, '').replace(/\//g, '-')}.md`,
        entryView: pageConfig.entryView,
        defaultHash: pageConfig.defaultHash,
        component: getLazyComponent(loader),
        category: 'frontend',
        dirName,
        states: pageConfig.states,
      }))
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
          prdPath: `../../src/docs/page-prds/${config.path.replace(/^\//, '').replace(/\//g, '-')}.md`,
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
