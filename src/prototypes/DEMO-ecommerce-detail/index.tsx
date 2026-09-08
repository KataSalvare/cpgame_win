import { useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import { DEMOBadge, DEMOButton, DEMOCard, DEMOErrorState, DEMOEmptyState, DEMOLoadingState, DEMOThemeFrame, type DEMOPageState } from '@/common/DEMOComponents'
import { usePrototypeState, type PrototypePreviewProps } from '@/prototypes/previewState'

const sizes = ['36', '37', '38', '39', '40', '41']

export default function DEMOEcommerceDetail(props: PrototypePreviewProps<DEMOPageState>) {
  const [state, setState] = usePrototypeState<DEMOPageState>('normal', props)
  const [size, setSize] = useState('38')
  const [quantity, setQuantity] = useState(1)
  const [favorite, setFavorite] = useState(false)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState<'details' | 'reviews'>('details')

  return (
    <DEMOThemeFrame theme="shopify">
      <div className="mx-auto max-w-[1180px] px-4 py-5">
        <header className="mb-6 flex items-center justify-between gap-4">
          <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" style={{ color: 'var(--demo-muted)' }}><ArrowLeft size={17} />返回商品</button>
          <div className="flex items-center gap-2"><span className="text-lg font-semibold tracking-[-0.04em]">NORTH / FIELD</span><DEMOIconButtonSmall icon={ShoppingBag} label="购物袋" /></div>
        </header>

        {state === 'loading' && <DEMOLoadingState />}
        {state === 'empty' && <DEMOEmptyState title="暂时没有可售商品" description="库存补充后，商品会重新出现在这里。" action={<DEMOButton onClick={() => setState('normal')}>查看全部商品</DEMOButton>} />}
        {state === 'error' && <DEMOErrorState onRetry={() => setState('normal')} />}

        {state === 'normal' && (
          <>
            <div className="grid gap-8">
              <div className="grid gap-3">
                <div className="order-2 flex gap-2"><DEMOProductThumb active={true} /><DEMOProductThumb /><DEMOProductThumb /></div>
                <div className="relative order-1 flex min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] p-8" style={{ background: 'linear-gradient(140deg, #d4f9e0, #fbfbf5 50%, #c1fbd4)' }}>
                  <div className="absolute left-5 top-5"><DEMOBadge tone="success">限量发售</DEMOBadge></div>
                  <button type="button" aria-label={favorite ? '取消收藏' : '收藏商品'} onClick={() => setFavorite(!favorite)} className="absolute right-5 top-5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/80" style={{ color: favorite ? 'var(--demo-danger)' : 'var(--demo-ink)' }}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button>
                  <div className="relative h-44 w-72 rotate-[-12deg] rounded-[45%] border-[18px] border-[#202725] bg-gradient-to-br from-[#f5fff5] via-[#c1fbd4] to-[#426d5b] shadow-2xl"><div className="absolute -bottom-10 left-1/2 h-16 w-40 -translate-x-1/2 rounded-[50%] bg-[#111] blur-md" /><div className="absolute right-5 top-5 h-10 w-24 rounded-full bg-white/50" /></div>
                </div>
              </div>

              <div className="pt-1">
                <div className="mb-4 flex items-center gap-2"><DEMOBadge tone="neutral">FIELD RUNNER 02</DEMOBadge><span className="text-xs" style={{ color: 'var(--demo-muted)' }}>春季系列</span></div>
                <h1 className="max-w-xl font-[var(--demo-font-display)] text-4xl font-medium tracking-[-0.06em]">城市之外，<br />每一步都算数。</h1>
                <div className="mt-5 flex items-center gap-3"><span className="text-2xl font-semibold">¥ 899</span><span className="text-sm line-through" style={{ color: 'var(--demo-muted)' }}>¥ 1,099</span><DEMOBadge tone="success">立省 ¥200</DEMOBadge></div>
                <p className="mt-5 max-w-lg text-sm leading-7" style={{ color: 'var(--demo-muted)' }}>轻量缓震跑鞋，适合日常通勤与周末长距离。透气织物鞋面，搭配可回收泡棉中底。</p>

                <div className="mt-7 border-t pt-6" style={{ borderColor: 'var(--demo-border)' }}>
                  <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold">选择尺码</span><button type="button" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--demo-muted)' }}>尺码指南 <ChevronDown size={14} /></button></div>
                  <div className="grid grid-cols-6 gap-2">{sizes.map((item) => <button type="button" key={item} onClick={() => setSize(item)} aria-pressed={size === item} className="min-h-11 rounded-xl border text-sm font-semibold transition-colors" style={{ borderColor: size === item ? 'var(--demo-accent)' : 'var(--demo-border)', background: size === item ? 'var(--demo-accent)' : 'var(--demo-surface)', color: size === item ? 'var(--demo-accent-contrast)' : 'var(--demo-ink)' }}>{item}</button>)}</div>
                </div>

                <div className="mt-6 flex flex-col gap-3"><div className="inline-flex min-h-11 w-full max-w-32 items-center justify-between rounded-[var(--demo-radius)] border px-3" style={{ borderColor: 'var(--demo-border)', background: 'var(--demo-surface)' }}><button type="button" aria-label="减少数量" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button><span className="text-sm font-semibold">{quantity}</span><button type="button" aria-label="增加数量" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button></div><DEMOButton className="w-full" onClick={() => setAdded(true)}>{added ? <><Check size={17} />已加入购物袋</> : <><ShoppingBag size={17} />加入购物袋</>}</DEMOButton></div>
                <div className="mt-6 grid gap-3"><DEMOMiniTrust icon={Truck} title="48 小时发货" /><DEMOMiniTrust icon={ShieldCheck} title="30 天无忧退换" /><DEMOMiniTrust icon={Star} title="4.9 / 5 好评" /></div>
              </div>
            </div>

            <div className="mt-12"><div className="flex gap-6 border-b" style={{ borderColor: 'var(--demo-border)' }}>{(['details', 'reviews'] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className="min-h-12 border-b-2 text-sm font-semibold" style={{ borderColor: tab === item ? 'var(--demo-accent)' : 'transparent', color: tab === item ? 'var(--demo-ink)' : 'var(--demo-muted)' }}>{item === 'details' ? '商品详情' : '用户评价（128）'}</button>)}</div><div className="grid gap-4 py-6">{tab === 'details' ? <><DEMODetailCard title="轻量织物" text="单只约 238g，长时间穿着也保持轻盈。" /><DEMODetailCard title="缓震中底" text="回弹泡棉帮助减少落地冲击，走跑皆宜。" /><DEMODetailCard title="可持续材料" text="鞋面含 45% 再生纤维，包装全部可回收。" /></> : <DEMOCard className="p-5"><div className="flex items-center gap-2"><span className="text-3xl font-semibold">4.9</span><span style={{ color: 'var(--demo-alt)' }}>★★★★★</span></div><p className="mt-2 text-sm" style={{ color: 'var(--demo-muted)' }}>“脚感很稳，通勤穿一整天也不累。尺码按平时选就好。”</p></DEMOCard>}</div></div>
          </>
        )}
      </div>
    </DEMOThemeFrame>
  )
}

function DEMOProductThumb({ active = false }: { active?: boolean }) { return <button type="button" aria-label="查看商品图片" className="h-20 w-20 rounded-2xl border p-2" style={{ borderColor: active ? 'var(--demo-accent)' : 'var(--demo-border)', background: 'linear-gradient(140deg, #d4f9e0, #fbfbf5)' }}><div className="h-full w-full rotate-[-15deg] rounded-[45%] bg-[#26352f]" /></button> }
function DEMOIconButtonSmall({ icon: Icon, label }: { icon: typeof ShoppingBag; label: string }) { return <button type="button" aria-label={label} title={label} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border" style={{ borderColor: 'var(--demo-border)', background: 'var(--demo-surface)' }}><Icon size={17} /></button> }
function DEMOMiniTrust({ icon: Icon, title }: { icon: typeof Truck; title: string }) { return <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--demo-muted)' }}><Icon size={16} style={{ color: 'var(--demo-accent)' }} /><span>{title}</span></div> }
function DEMODetailCard({ title, text }: { title: string; text: string }) { return <DEMOCard className="p-4"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-6" style={{ color: 'var(--demo-muted)' }}>{text}</p></DEMOCard> }
