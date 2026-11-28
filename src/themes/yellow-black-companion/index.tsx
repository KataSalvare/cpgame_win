/** @name 黄黑陪玩平台主题 */
import { useState } from 'react'
import { MessageSquare, Home, Users, Star } from 'lucide-react'
import { DesignMdBatchShowcase, type BatchShowcaseConfig } from '../../common/DesignMdBatchShowcase'
import { Avatar, Badge, Button, Card, CompanionTheme, Conversation, Dialog, Menu, Message, NoticeDialog, Navigation, SegmentedControl, Switch, Tag, TextField } from './components'
import theme from './theme.json'
import preview from './assets/preview.svg?url'
import WindowsSamples from './WindowsSamples'
import './style.css'

type Display = Omit<BatchShowcaseConfig, 'previewImages'> & { previewImages: Array<{ type: string; path: string }> }
const display = theme.display as Display
const config: BatchShowcaseConfig = { ...display, source: theme.source, previewImages: [{ type: 'local-preview', url: preview }] }
function ComponentSamples() {
  const [noticeDialog, setNoticeDialog] = useState(false); const [skipNotice, setSkipNotice] = useState(false); const [tab, setTab] = useState('会话'); const [enabled, setEnabled] = useState(true); const [nav, setNav] = useState('消息'); const [conversation, setConversation] = useState('认真玩玩'); const [dialog, setDialog] = useState(false); const [notice, setNotice] = useState('')
  const show = (message: string) => setNotice(message)
  return <CompanionTheme className="yb-samples" >
    <header className="yb-samples__header"><div><span>COMPONENTS / 100%</span><h2>标准组件</h2></div><span className="yb-size">实际尺寸</span></header>
    <div className="yb-grid">
      <article className="yb-block yb-wide"><h3>液态玻璃按钮</h3><div className="yb-row"><Button variant="primary" onClick={() => show('已触发确认下单')}>确认下单</Button><Button onClick={() => show('已取消')}>取消</Button><Button variant="danger" onClick={() => setDialog(true)}>删除聊天</Button><Button variant="primary" disabled>暂不可用</Button><Button variant="primary" shape="pill" onClick={() => show('已触发匹配')}>立即匹配</Button><Button variant="soft" shape="pill" onClick={() => show('已返回')}>返回</Button></div><p className="yb-demo-notice" role="status">{notice}</p></article>
      <article className="yb-block yb-wide"><h3>按钮状态</h3><div className="yb-state-grid"><div><span>默认</span><Button variant="primary">主要操作</Button></div><div><span>悬停</span><Button variant="primary" className="yb-state-hover">主要操作</Button></div><div><span>按下</span><Button variant="primary" className="yb-state-active">主要操作</Button></div><div><span>焦点</span><Button variant="primary" className="yb-state-focus">主要操作</Button></div><div><span>禁用</span><Button variant="primary" disabled>主要操作</Button></div></div></article>
      <article className="yb-block yb-wide"><h3>按钮类型</h3><div className="yb-state-grid"><div><span>主要</span><Button variant="primary">确认</Button></div><div><span>次要</span><Button>取消</Button></div><div><span>白灰</span><Button variant="soft">返回</Button></div><div><span>危险</span><Button variant="danger">删除</Button></div></div></article>
      <article className="yb-block"><h3>输入框</h3><TextField label="搜索" placeholder="搜索用户或俱乐部"/><TextField label="昵称" error="请输入昵称" placeholder="请输入昵称"/><TextField label="禁用" disabled value="暂不可编辑" readOnly/></article>
      <article className="yb-block"><h3>筛选与状态</h3><SegmentedControl label="列表类型" options={[{value:'会话',label:'会话'},{value:'好友',label:'好友'}]} value={tab} onChange={setTab}/><div className="yb-row"><Tag tone="online">✓ 在线</Tag><Tag>待服务</Tag><Badge label="8 条未读消息">8</Badge></div><Switch label="消息提醒" checked={enabled} onChange={setEnabled}/></article>
      <article className="yb-block"><h3>导航</h3><Navigation value={nav} onChange={setNav} items={[{value:'首页',label:'首页',icon:<Home size={16}/>},{value:'消息',label:'消息',icon:<MessageSquare size={16}/>,badge:8},{value:'我的房间',label:'我的房间',icon:<Users size={16}/>}]} /></article>
      <article className="yb-block"><h3>会话</h3><Conversation selected={conversation === '认真玩玩'} onClick={() => setConversation('认真玩玩')} avatar={<Avatar>玩</Avatar>} title="认真玩玩" description="一起开黑吗？" trailing={<Badge>2</Badge>}/><Conversation selected={conversation === '晚风'} onClick={() => setConversation('晚风')} avatar={<Avatar alternate>晚</Avatar>} title="晚风" description="现在可以玩" trailing={<small>18:20</small>}/></article>
      <article className="yb-block yb-wide"><h3>消息</h3><div className="yb-chat"><Message avatar={<Avatar alternate>晚</Avatar>}>要一起玩吗？</Message><Message self avatar={<Avatar>玩</Avatar>}>好呀，一起开黑！</Message><div className="yb-share"><strong>王者上分</strong><span>语音房 · 在线</span><Button variant="primary" onClick={() => show('已选择进入房间')}>进入房间</Button></div></div></article>
      <article className="yb-block"><h3>陪玩卡片</h3><Card><div className="yb-card__top"><Avatar size="large">晚</Avatar><div><strong>晚风</strong><small>陪玩</small></div><Tag tone="online">在线</Tag></div><p>王者荣耀 · 娱乐上分</p><div className="yb-card__footer"><span><Star size={15} fill="currentColor"/> 4.9</span><Button variant="primary" onClick={() => show('已选择聊天')}>聊一聊</Button></div></Card></article>
      <article className="yb-block"><h3>菜单</h3><Menu label="更多操作" items={[{id:'reply',label:'回复'},{id:'copy',label:'复制'},{id:'delete',label:'删除聊天',danger:true}]} onSelect={id => id === 'delete' ? setDialog(true) : show(id === 'reply' ? '已选择回复' : '已选择复制')}/></article>
      <article className="yb-block yb-wide"><h3>订单列表</h3><div className="yb-table-wrap"><table className="yb-table"><thead><tr><th>服务</th><th>陪玩</th><th>状态</th><th>金额</th><th>操作</th></tr></thead><tbody><tr><td>王者荣耀 · 娱乐上分</td><td>晚风</td><td>待服务</td><td>6000 金豆</td><td><button type="button" className="yb-link" onClick={() => show('已选择订单详情')}>查看详情</button></td></tr></tbody></table></div></article>
      <article className="yb-block yb-wide"><h3>公共弹窗</h3><div className="yb-row"><Button onClick={() => setDialog(true)}>打开确认弹窗</Button><Button onClick={() => setNoticeDialog(true)}>打开下单须知</Button></div></article>
    </div><Dialog open={dialog} overlayId="yb-example-dialog" title="删除聊天" onClose={() => setDialog(false)} footer={<><Button variant="soft" onClick={() => setDialog(false)}>取消</Button><Button variant="danger" onClick={() => { setDialog(false); show('已确认删除（演示）') }}>删除</Button></>}>删除后将移除该会话及聊天记录，确定继续吗？</Dialog>
    <NoticeDialog open={noticeDialog} overlayId="yb-example-notice" title="下单须知" onClose={() => setNoticeDialog(false)} onConfirm={() => { setNoticeDialog(false); show('已同意须知（演示）') }} reminder={{checked:skipNotice,onChange:setSkipNotice,label:'不再提醒'}}><div className="yb-notice-example" aria-label="须知图片展示区域"/></NoticeDialog>
  <WindowsSamples/></CompanionTheme>
}
export default function Component() { return <div className="yb-theme"><ComponentSamples/><DesignMdBatchShowcase config={config}/></div> }
