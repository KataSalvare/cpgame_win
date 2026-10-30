import { useState } from 'react'
import { ArrowLeft, CheckCircle2, QrCode, ShieldCheck } from 'lucide-react'
import { DialogPanel } from '@/components/WindowsClient'

type VerificationStep = 'notice' | 'phone' | 'identity' | 'qr' | 'success' | 'closed'

export function IdentityVerificationFlow({ onClose }: { onClose?: () => void } = {}) {
  const [step, setStep] = useState<VerificationStep>('notice')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [name, setName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [error, setError] = useState('')

  const sendCode = () => {
    if (phone.length !== 11) {
      setError('请输入 11 位手机号。')
      return
    }
    setError('')
    setCodeSent(true)
  }

  const bindPhone = () => {
    if (phone.length !== 11) {
      setError('请输入 11 位手机号。')
      return
    }
    if (!codeSent || code.length !== 6) {
      setError('请获取并填写 6 位验证码。')
      return
    }
    setError('')
    setStep('identity')
  }

  const continueToQr = () => {
    if (!name.trim()) {
      setError('请输入真实姓名。')
      return
    }
    if (idNumber.length !== 18) {
      setError('请输入 18 位身份证号码。')
      return
    }
    setError('')
    setStep('qr')
  }

  if (step === 'closed') return null

  const returnToIdentity = () => {
    setError('')
    setStep('identity')
  }
  const closeFlow = () => { setStep('closed'); onClose?.() }

  return <>
    {step === 'notice' && <DialogPanel overlayId="identity-verification-notice" title="需要完成实名认证" width={480} className="identity-flow-dialog" onClose={closeFlow}>
      <div className="identity-flow__body">
        <span className="identity-flow__icon"><ShieldCheck size={23} /></span>
        <p>按照国家法律法规规定，请先完成实名认证。</p>
        <button type="button" className="client-button client-button--primary identity-flow__primary" onClick={() => { setError(''); setStep('phone') }}>开始认证</button>
      </div>
    </DialogPanel>}

    {step === 'phone' && <DialogPanel overlayId="identity-verification-phone" title="绑定手机号" width={480} className="identity-flow-dialog" onClose={closeFlow} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => { setError(''); setStep('notice') }}><ArrowLeft size={15} />上一步</button><button type="button" className="client-button client-button--primary" onClick={bindPhone}>完成绑定</button></>}>
      <div className="identity-flow__form">
        <label className="identity-flow__field"><span>手机号</span><input id="identity-phone-input" autoComplete="off" inputMode="numeric" maxLength={11} placeholder="请输入11位手机号" value={phone} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, '').slice(0, 11)); setCode(''); setCodeSent(false); setError('') }} /></label>
        <div className="identity-flow__field"><span className="identity-flow__label"><label htmlFor="identity-code-input">验证码</label></span><span className="identity-flow__code"><input id="identity-code-input" autoComplete="off" inputMode="numeric" maxLength={6} placeholder="6 位验证码" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} /><button type="button" className="client-button client-button--secondary" onClick={sendCode} disabled={codeSent}>{codeSent ? '已获取' : '获取验证码'}</button></span></div>
        {error && <p className="identity-flow__error" role="alert">{error}</p>}
      </div>
    </DialogPanel>}

    {step === 'identity' && <DialogPanel overlayId="identity-verification-info" title="实名认证" width={480} className="identity-flow-dialog" onClose={closeFlow} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => { setError(''); setStep('phone') }}><ArrowLeft size={15} />上一步</button><button type="button" className="client-button client-button--primary" onClick={continueToQr}>继续</button></>}>
      <div className="identity-flow__form">
        <label className="identity-flow__field"><span>真实姓名</span><input autoComplete="off" placeholder="请输入真实姓名" value={name} onChange={(event) => { setName(event.target.value); setError('') }} /></label>
        <label className="identity-flow__field"><span>身份证号</span><input autoComplete="off" maxLength={18} placeholder="请输入18位身份证号" value={idNumber} onChange={(event) => { setIdNumber(event.target.value.slice(0, 18)); setError('') }} /></label>
        {error && <p className="identity-flow__error" role="alert">{error}</p>}
      </div>
    </DialogPanel>}

    {step === 'qr' && <DialogPanel overlayId="identity-verification-qr" title="人脸核验" width={440} className="identity-flow-dialog" onClose={closeFlow} footer={<><button type="button" className="client-button client-button--secondary" onClick={returnToIdentity}><ArrowLeft size={15} />上一步</button><button type="button" className="client-button client-button--primary" onClick={() => setStep('success')}>我已认证</button></>}>
      <div className="identity-flow__qr-panel">
        <DemoQrCode />
        <strong><QrCode size={16} />请使用手机扫码进行人脸核验</strong>
      </div>
    </DialogPanel>}

    {step === 'success' && <DialogPanel overlayId="identity-verification-success" title="认证成功" width={420} className="identity-flow-dialog" onClose={closeFlow} footer={<button type="button" className="client-button client-button--primary" onClick={closeFlow}>完成</button>}>
      <div className="identity-flow__success" role="status"><span><CheckCircle2 size={34} /></span></div>
    </DialogPanel>}
  </>
}

function DemoQrCode() {
  const size = 29
  const finders = [[0, 0], [22, 0], [0, 22]] as const
  const cells = Array.from({ length: size * size }, (_, index) => {
    const x = index % size
    const y = Math.floor(index / size)
    const inFinder = finders.some(([left, top]) => x >= left && x < left + 7 && y >= top && y < top + 7)
    if (inFinder) {
      const [left, top] = finders.find(([left, top]) => x >= left && x < left + 7 && y >= top && y < top + 7)!
      const edge = x === left || x === left + 6 || y === top || y === top + 6
      const center = x >= left + 2 && x <= left + 4 && y >= top + 2 && y <= top + 4
      return { x, y, active: edge || center }
    }
    return { x, y, active: ((x * 11 + y * 7 + x * y * 3 + x * x + y * y) % 9) < 4 }
  })

  return <svg className="identity-flow__qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="仅供演示的二维码图案">
    <rect width={size} height={size} fill="#fff" />
    {cells.filter((cell) => cell.active).map((cell) => <rect key={`${cell.x}-${cell.y}`} x={cell.x} y={cell.y} width="1" height="1" fill="#1f2937" />)}
    <rect x="11" y="11" width="7" height="7" rx="1" fill="#fff" stroke="#9ca3af" strokeWidth=".5" />
    <text x="14.5" y="15.6" textAnchor="middle" fontSize="2.4" fill="#374151">DEMO</text>
  </svg>
}
