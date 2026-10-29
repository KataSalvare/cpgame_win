import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CircleAlert, LoaderCircle, QrCode, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { usePrototypeState, type PrototypePreviewProps } from '@/prototypes/previewState'

type LoginPageState = 'normal' | 'loading' | 'empty' | 'error'
type Agreement = '用户协议' | '隐私协议'

const isPhoneNumber = (value: string) => /^1\d{10}$/.test(value)

function finderCell(x: number, y: number, originX: number, originY: number) {
  const localX = x - originX
  const localY = y - originY
  if (localX < 0 || localY < 0 || localX > 6 || localY > 6) return null
  const edge = localX === 0 || localY === 0 || localX === 6 || localY === 6
  const center = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4
  return edge || center
}

function DemoQrCode({ revision }: { revision: number }) {
  const cells = useMemo(() => {
    const size = 25
    const matrix: boolean[][] = []
    for (let y = 0; y < size; y += 1) {
      const row: boolean[] = []
      for (let x = 0; x < size; x += 1) {
        const finder = finderCell(x, y, 0, 0)
          ?? finderCell(x, y, size - 7, 0)
          ?? finderCell(x, y, 0, size - 7)
        const reservedFinderArea = (x < 8 && y < 8)
          || (x >= size - 8 && y < 8)
          || (x < 8 && y >= size - 8)
        const value = (x * 19 + y * 31 + x * y * 7 + revision * 13) % 11 < 5
        row.push(finder ?? (!reservedFinderArea && value))
      }
      matrix.push(row)
    }
    return matrix
  }, [revision])

  return (
    <svg className="gc-login-qr" viewBox="0 0 33 33" role="img" aria-label="登录二维码">
      <rect width="33" height="33" fill="white" />
      {cells.flatMap((row, y) => row.map((isDark, x) => isDark
        ? <rect key={`${x}-${y}`} x={x + 4} y={y + 4} width="1" height="1" fill="#1f2937" />
        : null))}
    </svg>
  )
}

function AgreementDialog({ agreement, onClose }: { agreement: Agreement; onClose: () => void }) {
  return (
    <div className="gc-login-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="gc-login-dialog" role="dialog" aria-modal="true" aria-labelledby="gc-login-dialog-title">
        <header>
          <h2 id="gc-login-dialog-title">《{agreement}》</h2>
          <button type="button" className="gc-login-icon-button" onClick={onClose} aria-label="关闭协议">
            <X size={18} />
          </button>
        </header>
        <p>协议内容待补充。</p>
        <button type="button" className="gc-login-secondary-button" onClick={onClose}>关闭</button>
      </section>
    </div>
  )
}

function LoginContent({ onOpenAgreement }: { onOpenAgreement: (agreement: Agreement) => void }) {
  const navigate = useNavigate()
  const [activeMethod, setActiveMethod] = useState<'phone' | 'qr'>('phone')
  const [accepted, setAccepted] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [qrRevision, setQrRevision] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const sendCode = () => {
    setError('')
    if (!isPhoneNumber(phone)) {
      setError('请输入正确的 11 位手机号。')
      return
    }
    setCodeSent(true)
    setNotice('验证码已发送')
  }

  const submitPhoneLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!accepted) {
      setError('请先勾选同意《用户协议》和《隐私协议》。')
      return
    }
    if (!isPhoneNumber(phone)) {
      setError('请输入正确的 11 位手机号。')
      return
    }
    if (!codeSent) {
      setError('请先获取验证码。')
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setError('请输入 6 位验证码。')
      return
    }
    navigate('/game-companion-client')
  }

  const refreshQr = () => {
    setQrRevision((revision) => revision + 1)
    setNotice('二维码已刷新（演示）')
  }

  return (
    <main className="gc-login-layout">
      <section className="gc-login-brand" aria-labelledby="gc-login-brand-title">
        <div className="gc-login-brand-mark" aria-hidden="true"><QrCode size={30} strokeWidth={1.5} /></div>
        <div className="gc-login-brand-copy">
          <h1 id="gc-login-brand-title">超速电竞</h1>
          <p>超速电竞，专业游戏陪玩平台。海量大神快速匹配，组队开黑，轻松上分，乐享电竞陪伴时光。</p>
        </div>
      </section>

      <section className="gc-login-card" aria-labelledby="gc-login-title">
        <header className="gc-login-card-heading">
          <h2 id="gc-login-title">登录</h2>
        </header>

        <div className="gc-login-tabs" role="tablist" aria-label="登录方式">
          <button type="button" role="tab" id="gc-login-phone-tab" aria-selected={activeMethod === 'phone'} aria-controls="gc-login-phone-panel" onClick={() => { setActiveMethod('phone'); setError(''); setNotice('') }}>手机号登录</button>
          <button type="button" role="tab" id="gc-login-qr-tab" aria-selected={activeMethod === 'qr'} aria-controls="gc-login-qr-panel" onClick={() => { setActiveMethod('qr'); setError(''); setNotice('') }}>扫码登录</button>
        </div>

        {activeMethod === 'phone' ? (
          <form id="gc-login-phone-panel" role="tabpanel" aria-labelledby="gc-login-phone-tab" className="gc-login-form" onSubmit={submitPhoneLogin}>
            <label className="gc-login-field">
              <span>手机号</span>
              <input type="tel" inputMode="numeric" autoComplete="tel" maxLength={11} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))} placeholder="请输入手机号" />
            </label>
            <label className="gc-login-field">
              <span>验证码</span>
              <span className="gc-login-code-row">
                <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} aria-label="验证码（6位）" placeholder="6 位验证码" />
                <button type="button" className="gc-login-code-button" onClick={sendCode}>获取验证码</button>
              </span>
            </label>
            {notice && <p className="gc-login-notice" role="status"><Check size={14} />{notice}</p>}
            {error && <p className="gc-login-error" role="alert"><CircleAlert size={14} />{error}</p>}
            <button type="submit" className="gc-login-submit">登录并继续</button>
          </form>
        ) : (
          <div id="gc-login-qr-panel" role="tabpanel" aria-labelledby="gc-login-qr-tab" className="gc-login-qr-panel">
            <div className="gc-login-qr-frame">
              {accepted
                ? <DemoQrCode revision={qrRevision} />
                : <div className="gc-login-qr-locked"><ShieldCheck size={22} /><span>勾选协议后显示二维码</span></div>}
            </div>
            <p className="gc-login-qr-title">使用超速电竞 App 扫码</p>
            <button type="button" className="gc-login-refresh" onClick={refreshQr} disabled={!accepted}><RefreshCw size={15} />刷新二维码</button>
            {notice && <p className="gc-login-notice gc-login-qr-notice" role="status"><Check size={14} />{notice}</p>}
            {error && <p className="gc-login-error" role="alert"><CircleAlert size={14} />{error}</p>}
          </div>
        )}

        <div className="gc-login-agreement">
          <label>
            <input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setError('') }} />
            <span className="gc-login-checkbox" aria-hidden="true">{accepted && <Check size={12} />}</span>
            <span>我已阅读并同意</span>
          </label>
          <button type="button" onClick={() => onOpenAgreement('用户协议')}>《用户协议》</button>
          <span>和</span>
          <button type="button" onClick={() => onOpenAgreement('隐私协议')}>《隐私协议》</button>
        </div>
      </section>
    </main>
  )
}

function LoginLoading() {
  return (
    <main className="gc-login-state-wrap" role="status" aria-live="polite">
      <section className="gc-login-state-card">
        <LoaderCircle className="gc-login-spinner" size={26} aria-hidden="true" />
        <h1>正在加载</h1>
      </section>
    </main>
  )
}

function LoginError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="gc-login-state-wrap">
      <section className="gc-login-state-card" role="alert">
        <CircleAlert size={26} aria-hidden="true" />
        <h1>页面暂时无法显示</h1>
        <button type="button" className="gc-login-submit gc-login-state-retry" onClick={onRetry}>重试</button>
      </section>
    </main>
  )
}

export function LoginPage(props: PrototypePreviewProps<LoginPageState>) {
  const [pageState, setPageState] = usePrototypeState<LoginPageState>('normal', props)
  const [activeAgreement, setActiveAgreement] = useState<Agreement | null>(null)

  if (pageState === 'loading') return <LoginLoading />
  if (pageState === 'error') return <LoginError onRetry={() => setPageState('normal')} />

  return (
    <div className="gc-login-page">
      <LoginContent onOpenAgreement={setActiveAgreement} />
      {activeAgreement && <AgreementDialog agreement={activeAgreement} onClose={() => setActiveAgreement(null)} />}
    </div>
  )
}
