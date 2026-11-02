import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Camera, Check, CircleAlert, LoaderCircle, QrCode, RefreshCw, ShieldCheck, UserRound, X } from 'lucide-react'
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
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [qrRevision, setQrRevision] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [completingProfile, setCompletingProfile] = useState(false)
  const [nickname, setNickname] = useState('晚风玩家')
  const [birthday, setBirthday] = useState('2000-01-01')
  const [gender, setGender] = useState<'女' | '男'>('女')
  const [avatarDataUrl, setAvatarDataUrl] = useState('')
  const birthdayInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (codeCountdown <= 0) return
    const timer = window.setTimeout(() => setCodeCountdown((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [codeCountdown])

  const sendCode = () => {
    setError('')
    if (!isPhoneNumber(phone)) {
      setError('请输入正确的 11 位手机号。')
      return
    }
    setCodeSent(true)
    setCodeCountdown(60)
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
    setCompletingProfile(true)
    setError('')
  }

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = nickname.trim()
    if (!name) {
      setError('请输入昵称。')
      return
    }
    try {
      sessionStorage.setItem('gc-new-user-profile', JSON.stringify({ nickname: name, initials: name.slice(0, 2), birthday, gender, avatarDataUrl: avatarDataUrl || undefined }))
    } catch {
      setError('资料暂时无法保存，请重试。')
      return
    }
    navigate('/game-companion-client')
  }

  const chooseAvatar = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarDataUrl(String(reader.result))
    reader.onerror = () => setError('头像读取失败，请重新选择图片。')
    reader.readAsDataURL(file)
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

      <section className="gc-login-card" aria-label={completingProfile ? '完善信息' : undefined} aria-labelledby={completingProfile ? undefined : 'gc-login-title'}>
        {!completingProfile && <header className="gc-login-card-heading"><h2 id="gc-login-title">登录</h2></header>}

        {!completingProfile && <div className="gc-login-tabs" role="tablist" aria-label="登录方式">
          <button type="button" role="tab" id="gc-login-phone-tab" aria-selected={activeMethod === 'phone'} aria-controls="gc-login-phone-panel" onClick={() => { setActiveMethod('phone'); setError(''); setNotice('') }}>手机号登录</button>
          <button type="button" role="tab" id="gc-login-qr-tab" aria-selected={activeMethod === 'qr'} aria-controls="gc-login-qr-panel" onClick={() => { setActiveMethod('qr'); setError(''); setNotice('') }}>扫码登录</button>
        </div>}

        {completingProfile ? (
          <form className="gc-onboarding-form" onSubmit={submitProfile}>
            <div className="gc-onboarding-heading"><strong>欢迎来到超速电竞</strong><span>完善信息，为您推荐个性化内容~</span></div>
            <div className="gc-onboarding-avatar-wrap">
              <button type="button" className="gc-onboarding-avatar" aria-label="更换默认头像" onClick={() => avatarInputRef.current?.click()}>
                {avatarDataUrl ? <img src={avatarDataUrl} alt="当前头像" /> : <span><UserRound size={48} /></span>}
                <i><Camera size={15} /></i>
              </button>
              <input ref={avatarInputRef} className="gc-visually-hidden" type="file" accept="image/*" aria-label="选择头像图片" onChange={(event) => { chooseAvatar(event.currentTarget.files?.[0]); event.currentTarget.value = '' }} />
            </div>
            <label className="gc-onboarding-field"><span>昵称<em>*</em></span><input required maxLength={20} value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="请输入昵称" /></label>
            <label className="gc-onboarding-field"><span>生日</span><span className="gc-onboarding-date"><input ref={birthdayInputRef} type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} aria-label="生日" /><button type="button" aria-label="选择生日" onClick={() => birthdayInputRef.current?.showPicker?.()}><CalendarDays size={16} /></button></span></label>
            <fieldset className="gc-onboarding-gender"><legend>性别</legend><div>{(['女', '男'] as const).map((value) => <button type="button" key={value} aria-pressed={gender === value} className={gender === value ? 'is-selected' : ''} onClick={() => setGender(value)}>{value}</button>)}</div></fieldset>
            {error && <p className="gc-login-error" role="alert"><CircleAlert size={14} />{error}</p>}
            <button type="submit" className="gc-onboarding-submit">进入超速，让游戏改变生活</button>
          </form>
        ) : activeMethod === 'phone' ? (
          <form id="gc-login-phone-panel" role="tabpanel" aria-labelledby="gc-login-phone-tab" className="gc-login-form" onSubmit={submitPhoneLogin}>
            <label className="gc-login-field">
              <span>手机号</span>
              <input type="tel" inputMode="numeric" autoComplete="tel" maxLength={11} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))} placeholder="请输入手机号" />
            </label>
            <label className="gc-login-field">
              <span>验证码</span>
              <span className="gc-login-code-row">
                <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} aria-label="验证码（6位）" placeholder="6 位验证码" />
                <button type="button" className="gc-login-code-button" onClick={sendCode} disabled={codeCountdown > 0}>{codeCountdown > 0 ? `${codeCountdown}秒后重新获取` : codeSent ? '重新获取' : '获取验证码'}</button>
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
