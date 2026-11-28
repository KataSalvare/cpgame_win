import './glass-specs.css'

const buttonCss = `.glass-button {
  min-height: 48px; padding: 0 16px;
  border: 0; border-radius: 9999px;
  color: #35322a; font-weight: 600;
  background: linear-gradient(155deg,
    rgb(255 255 255 / 85%),
    rgb(255 255 255 / 38%) 48%,
    rgb(220 216 205 / 32%));
  box-shadow: inset 0 1px 2px rgb(255 255 255 / 95%),
    inset 0 -2px 5px rgb(112 105 86 / 10%),
    0 3px 9px rgb(62 55 38 / 11%);
  backdrop-filter: blur(12px);
  transition: filter 160ms ease, transform 160ms ease;
}`
const primaryCss = `.glass-button--primary {
  color: #332800;
  background: linear-gradient(155deg,
    rgb(255 239 139 / 94%),
    rgb(255 214 10 / 78%) 52%,
    rgb(243 190 0 / 72%));
  box-shadow: inset 0 1px 2px rgb(255 255 255 / 85%),
    inset 0 -2px 5px rgb(157 112 0 / 12%),
    0 3px 9px rgb(165 124 0 / 16%);
}
.glass-button:hover:not(:disabled) { filter: brightness(1.05); }
.glass-button:active:not(:disabled) { transform: translateY(1px); }
.glass-button:focus-visible { outline: 2px solid #5b4a00; outline-offset: 2px; }
.glass-button:disabled { background: #e5e6eb; color: #69717e; box-shadow: none; }
.glass-button--primary:disabled {
  background: linear-gradient(155deg, rgb(255 239 139 / 94%),
    rgb(255 214 10 / 78%) 52%, rgb(243 190 0 / 72%));
  box-shadow: inset 0 1px 2px rgb(255 255 255 / 85%),
    inset 0 -2px 5px rgb(157 112 0 / 12%), 0 3px 9px rgb(165 124 0 / 16%);
}
@media (prefers-reduced-motion: reduce) {
  .glass-button { transition: none; }
}`
const profileCss = `.profile-glass {
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 24px;
  background:
    radial-gradient(ellipse at 18% 100%, rgb(225 213 255 / 65%), transparent 48%),
    radial-gradient(ellipse at 95% 86%, rgb(255 224 131 / 65%), transparent 44%),
    linear-gradient(145deg, rgb(255 255 255 / 94%), rgb(247 248 252 / 88%));
  box-shadow: 0 16px 40px rgb(40 43 61 / 16%),
    inset 0 1px 1px rgb(255 255 255 / 95%);
  backdrop-filter: blur(20px);
}`
const floatCss = `.floating-glass {
  border: 0; border-radius: 16px;
  background:
    radial-gradient(ellipse at 10% 110%, rgb(221 211 255 / 76%), transparent 58%),
    radial-gradient(ellipse at 100% 90%, rgb(255 226 151 / 62%), transparent 54%),
    linear-gradient(145deg, rgb(255 255 255 / 94%), rgb(242 244 250 / 88%));
  box-shadow: 0 8px 24px rgb(40 43 61 / 16%),
    inset 0 1px 1px rgb(255 255 255 / 90%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}`
const matchCss = `.match-mini-glass {
  border: 0; border-radius: 18px; color: #292200;
  background:
    radial-gradient(ellipse at 10% 10%, rgb(255 255 255 / 78%), transparent 55%),
    linear-gradient(135deg, rgb(255 238 144 / 94%), rgb(255 211 46 / 90%));
  box-shadow: 0 10px 26px rgb(115 84 0 / 20%),
    inset 0 1px 1px rgb(255 255 255 / 90%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}`
function CodeCard({title,children}: {title:string; children:string}) { return <section className="glass-code-card"><h3>{title}</h3><pre><code>{children}</code></pre></section> }
export function GlassButtonSpecs() { return <section className="glass-specs"><div className="guide-section-title"><h2>液态玻璃按钮 · 开发参数</h2><span>CSS 示例对应现有 GlassButton</span></div><div className="glass-specs-grid"><CodeCard title="次要按钮">{buttonCss}</CodeCard><CodeCard title="主按钮与状态">{primaryCss}</CodeCard></div><p className="glass-specs-note">渐变与透明度叠加在真实背景上；先绘制半透明色层，再模糊背后内容，最后叠加内高光和外阴影。无模糊支持时渐变仍可呈现。主按钮黄底深字；焦点、禁用与减少动态效果状态按上方实现。</p></section> }
export function GlassPanelSpecs() { return <section className="glass-specs panel-glass-specs"><div className="guide-section-title"><h2>液态玻璃面板 · 开发参数</h2><span>与上方对应的客户端样式一致</span></div><div className="glass-specs-grid three"><CodeCard title="个人快捷面板">{profileCss}</CodeCard><CodeCard title="录屏 / 语音房悬浮面板">{floatCss}</CodeCard><CodeCard title="匹配缩小态">{matchCss}</CodeCard></div><p className="glass-specs-note">多层背景按 CSS 从前到后绘制：局部紫色与暖黄色光晕覆盖在白灰半透明底色上，内阴影形成高光。匹配缩小态使用黄色渐变；完整一键匹配面板使用深色标题与白色内容区。</p></section> }
