import { useState } from 'react'
import { ChatMessage } from '@/prototypes/game-companion-client/pages/SocialPages'
import { FixedMessageFeedPanel } from '@/prototypes/game-companion-client/components/FixedMessageFeedPanel'
import { initialConversations, supportOrderSample, supportReviewSample, type SocialMessage } from '@/prototypes/game-companion-client/data/socialMockData'
import '@/prototypes/game-companion-client/style.css'
import '@/prototypes/game-companion-client/high-fidelity.css'
import './message-guide.css'

const base: SocialMessage = { id:'sample', senderId:'friend-1', senderName:'晚风', initials:'风', time:'16:08', kind:'text', content:'今晚一起开黑吗？' }
const seed = initialConversations.find(item => item.id === 'direct-friend-1')!.messages
const byKind = (kind: SocialMessage['kind']) => seed.find(item => item.kind === kind)!
const examples: {title:string; note:string; messages:SocialMessage[]}[] = [
  {title:'文字消息',note:'双方白底 · 最大宽 540 px · 内边距 9 × 12 px · 圆角 8 px',messages:[base,{...base,id:'self',senderId:'player',senderName:'林小满',initials:'满',content:'好呀，马上来！'}]},
  {title:'图片消息',note:'210 × 至少 108 px · 白底 · 圆角 7 px',messages:[byKind('image')]},
  {title:'语音消息',note:'至少 92 × 40 px · 对方白底 / 自己 #FFD60A · 圆角 8 px',messages:[byKind('voice'),{...byKind('voice'),id:'self-voice',senderId:'player',senderName:'林小满',initials:'满'}]},
  {title:'表情消息',note:'无气泡背景 · 字号 30 px',messages:[{...base,id:'emoji',kind:'emoji',content:'😊'}]},
  {title:'礼物消息',note:'白底 · 玫瑰图示 32 px · 数量随内容变化',messages:[byKind('gift'),{...byKind('gift'),id:'self-gift',senderId:'player',senderName:'林小满',initials:'满',gift:{id:'gift-02',name:'热烈掌声',quantity:2}}]},
  {title:'回复与撤回',note:'引用最多 300 px · 撤回为透明底 12 px 文字',messages:[{...base,id:'reply',replyTo:{senderName:'林小满',kind:'text',content:'准备好了吗？'}},{...base,id:'recall',recalled:true}]},
  {title:'陪玩名片',note:'220 px 宽 · 16 px 圆角 · 浅黄渐变',messages:[byKind('companion-share')]},
  {title:'房间分享',note:'220 px 宽 · 16 px 圆角 · 浅黄渐变 · 操作高 26 px',messages:[byKind('room-share')]},
  {title:'订单消息',note:'300 px 宽 · 白底 · 12 px 圆角 · 内边距 12 px',messages:[{...base,id:'order',...supportOrderSample}]},
  {title:'客服评价',note:'240 px 宽 · 白底 · 10 px 圆角 · 星级与提交状态',messages:[{...base,id:'review',...supportReviewSample},{...base,id:'reviewed',...supportReviewSample,review:{support:'GM-客服',rating:5,submitted:true}}]},
]
export function MessageGuide() {
 const [playing,setPlaying] = useState<string | null>(null)
 return <div className="companion-guide message-guide" data-prototype-palette="high-fidelity"><header className="guide-header"><div><span>黄黑陪玩平台 / UI 说明</span><h1>消息样式</h1></div><div className="guide-header-meta">Windows 客户端 · 1920 × 1080</div></header><main className="guide-content"><div className="guide-section-title"><h2>聊天消息</h2><span>复用消息页组件与高保真样式</span></div><div className="message-guide-grid game-companion-client messages-page">{examples.map(group => <section className="message-guide-sample" key={group.title}><h2>{group.title}</h2><div className="message-guide-stage">{group.messages.map(message => <ChatMessage key={message.id} message={message} identityMode="direct" showInlineTime={false} playing={playing === message.id} onTogglePlay={() => setPlaying(playing === message.id ? null : message.id)} onOpenVoiceRoom={() => {}} />)}</div><p>{group.note}</p></section>)}</div><div className="guide-section-title"><h2>系统与群通知</h2><span>消息列表中的固定通知</span></div><div className="message-guide-notifications game-companion-client messages-page"><section><h3>系统通知</h3><FixedMessageFeedPanel feed="system" requests={[]} onResolve={() => {}} /></section><section><h3>群通知</h3><FixedMessageFeedPanel feed="groups" requests={[{id:'guide-request',conversationId:'group-squad',applicantId:'friend-1',name:'晚风',initials:'风',groupName:'周末五排小队',reason:'申请加入群聊',time:'今天 16:08',status:'pending'}]} onResolve={() => {}} /></section></div></main></div>
}
