import { useState } from 'react'
import { Bell, Gamepad2, Headphones, Home, MessageCircle, Search, Settings, Users, Wallet } from 'lucide-react'
import { WindowsClientFrame, WindowsSidebar, WindowsTitleBar } from '@/components/WindowsClient'
import { SideDrawer } from '@/themes/grayscale-prototype/components/SideDrawer'
import logo from '@/prototypes/game-companion-client/assets/platform-logo.webp'
import '@/prototypes/game-companion-client/style.css'
import '@/prototypes/game-companion-client/high-fidelity.css'
import './framework-guide.css'

const items = [
 {id:'match',label:'一键匹配',icon:<Gamepad2 size={22}/>,variant:'primary' as const},
 {id:'home',label:'首页',icon:<Home size={22}/>,group:'main',groupTitle:''},
 {id:'talents',label:'大神',icon:<Users size={22}/>,group:'main',groupTitle:''},
 {id:'messages',label:'消息',icon:<MessageCircle size={22}/>,badge:3,group:'main',groupTitle:''},
 {id:'room',label:'我的房间',icon:<Headphones size={22}/>,group:'main',groupTitle:''},
 {id:'wallet',label:'我的钱包',icon:<Wallet size={22}/>,group:'account',groupTitle:''},
]
export function FrameworkGuide() {
 const [active,setActive] = useState('home'); const [drawer,setDrawer] = useState(true)
 return <div className="companion-guide framework-guide" data-prototype-palette="high-fidelity"><header className="guide-header"><div><span>黄黑陪玩平台 / UI 说明</span><h1>核心框架</h1></div><div className="guide-header-meta">Windows 客户端组件</div></header><main className="guide-content"><div className="framework-heading"><div><h2>客户端窗口</h2><p>下方示例按 1920 × 1080 布局，缩小至 60% 展示；尺寸标注均为实际 CSS 像素。</p></div><button type="button" onClick={() => setDrawer(!drawer)}>{drawer ? '收起右侧抽屉' : '显示右侧抽屉'}</button></div><div className="framework-layout"><div className="framework-preview"><div className="framework-preview-scale"><WindowsClientFrame className="game-companion-client" titleBar={<WindowsTitleBar title="超速电竞" leading={<img className="client-platform-logo" src={logo} alt=""/>} actions={<><button className="client-titlebar-search" type="button"><Search size={15}/><span>搜索语音房、俱乐部或用户</span></button><button className="client-titlebar-support" aria-label="系统设置" type="button"><Settings size={16}/></button><button className="client-titlebar-support" aria-label="客户端通知" type="button"><Bell size={16}/></button></>}/>} sidebar={<WindowsSidebar items={items} activeId={active} onSelect={setActive} footer={<div className="framework-account">● 晚风玩家 V4</div>}/>} rightPanel={drawer ? <SideDrawer mode="inline" width={480} title="详情面板" onClose={() => setDrawer(false)}><div className="framework-drawer-example"><strong>右侧详情</strong><p>内容区域独立滚动</p></div></SideDrawer> : undefined} rightPanelWidth={480}><div className="framework-example-content"><h2>主内容区</h2><p>页面内容从此区域开始，实际布局由业务页面决定。</p><div className="framework-placeholder"><strong>内容卡片</strong><p>主内容区支持独立滚动</p></div></div></WindowsClientFrame></div></div><aside className="framework-specs"><h2>结构与尺寸</h2><dl><div><dt>窗口画布</dt><dd>1920 × 1080 px</dd></div><div><dt>顶部标题栏</dt><dd>高 40 px</dd></div><div><dt>左侧导航</dt><dd>宽 240 px</dd></div><div><dt>主内容区</dt><dd>默认内边距 24 px</dd></div><div><dt>工作区</dt><dd>右、下各留 16 px<br/>白底 · 圆角 18 px</dd></div><div><dt>右侧抽屉</dt><dd>宽 480 px · 距边 16 px<br/>#F0F1F7 · 圆角 20 px</dd></div></dl><h2>表面与层级</h2><p>标题栏与导航共享暖灰渐变背景，主内容为白色。抽屉覆盖内容区，以柔和阴影区分层级。</p><p>导航普通项最小高 46 px、圆角 12 px；选中白底。主操作使用黄色玻璃渐变。</p></aside></div><div className="framework-foot"><section><h2>多栏组合</h2><p>公共框架支持导航栏、可选列表栏、主内容和右侧面板。列表栏默认 240 px，通用右栏默认 360 px；高保真业务抽屉使用 480 px 覆盖布局。</p></section><section><h2>滚动与适配</h2><p>主内容及抽屉内容分别滚动；原型画布保持 1920 × 1080，工作台等比缩放，不改变页面布局尺寸。</p></section><section><h2>标题栏控件</h2><p>搜索框 360 × 28 px、圆角 14 px；右侧放置工具入口与窗口控制。图标、导航选中及焦点以实际公共组件为准。</p></section></div></main></div>
}
