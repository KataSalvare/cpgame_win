import { WindowsSidebar } from '@/components/WindowsClient'
import gamepad from '@/prototypes/game-companion-client/assets/quick-match-gamepad.webp'
import './match-button-specs.css'

const css = `@property --match-glow-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
.match-button {
  position: relative; min-height: 56px;
  border: 2px solid #ffd24b; border-radius: 999px;
  background:
    radial-gradient(ellipse at 18% 0%, rgb(255 255 255 / 85%), transparent 30%),
    radial-gradient(ellipse at 78% 110%, #fff97b 0%, transparent 42%),
    linear-gradient(105deg, #ff5414 5%, #ff7c08 42%, #ffbe08 78%, #ffa600 100%);
  color: #fff; font-size: 18px;
  text-shadow: 0 1px 3px rgb(145 61 0 / 45%);
  box-shadow: inset 0 2px 3px rgb(255 255 255 / 75%),
    inset 0 -3px 4px rgb(255 226 63 / 70%),
    0 3px 9px rgb(255 167 0 / 35%);
}
.match-button::after {
  content: ""; position: absolute; inset: -2px;
  border: 3px solid transparent; border-radius: inherit;
  background: conic-gradient(from var(--match-glow-angle),
    transparent 0deg 270deg, #fff 315deg, #fff9ad 330deg,
    transparent 360deg) border-box;
  mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0) border-box;
  mask-composite: exclude; opacity: 0; pointer-events: none;
}
.match-button:hover::after, .is-matching .match-button::after {
  opacity: 1; animation: match-border-glow 2s linear infinite;
}
@keyframes match-border-glow { to { --match-glow-angle: 360deg; } }
.match-button:focus-visible { outline: 2px solid #9a4700; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .match-button:hover::after, .is-matching .match-button::after { animation: none; }
}`
const noop = () => {}
function Example({ label, matching = false }: { label: string; matching?: boolean }) {
 return <div className={`match-button-example game-companion-client${matching ? ' is-matching' : ''}`}><WindowsSidebar items={[{id:'match',label,variant:'primary',icon:<img className="client-quick-match-icon" src={gamepad} alt=""/>}]} activeId="" onSelect={noop}/></div>
}
export function MatchButtonSpecs() {
 return <section className="match-button-specs"><div className="guide-section-title"><h2>一键匹配按钮</h2><span>侧栏入口 · 使用客户端实际组件和素材</span></div><div className="match-button-specs-layout"><div className="match-button-states"><div><h3>默认 / 悬停</h3><Example label="一键匹配"/><p>悬停显示环形流光；可使用键盘 Tab 查看焦点。</p></div><div><h3>匹配中</h3><Example label="匹配中" matching/><p>匹配期间持续显示流光。</p></div><div><h3>等待选人</h3><Example label="等待选人" matching/><p>出现候选陪玩后更换文案，保留流光。</p></div><p>最小高度 56 px · 图标 48 × 48 px · 2 px 描边 · 胶囊圆角。当前实现的默认、悬停及选中共用底色；没有单独定义按下或禁用样式。</p></div><div className="glass-code-card"><h3>渐变、状态与流光 CSS</h3><pre><code>{css}</code></pre><p>流光由伪元素、圆锥渐变和遮罩形成，2 秒旋转一周；减少动态效果时停止旋转。匹配最小化卡也使用同一流光规则。</p></div></div></section>
}
