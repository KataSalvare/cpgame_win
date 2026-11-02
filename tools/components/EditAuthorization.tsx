import { useCallback, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Check, LockKeyhole } from 'lucide-react'
import { EditAuthorizationContext } from './editAuthorizationContext'

const EDIT_SESSION_KEY = 'prototype-spec-edit-verified'

export function EditAuthorizationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const resolveRef = useRef<((allowed: boolean) => void) | null>(null)

  const requestAuthorization = useCallback(() => {
    if (!import.meta.env.PROD || sessionStorage.getItem(EDIT_SESSION_KEY) === 'true') return Promise.resolve(true)
    if (resolveRef.current) return Promise.resolve(false)
    setPassword('')
    setError(false)
    setOpen(true)
    return new Promise<boolean>((resolve) => { resolveRef.current = resolve })
  }, [])

  const finish = (allowed: boolean) => {
    if (allowed) sessionStorage.setItem(EDIT_SESSION_KEY, 'true')
    resolveRef.current?.(allowed)
    resolveRef.current = null
    setOpen(false)
    setPassword('')
  }

  const verify = (event: FormEvent) => {
    event.preventDefault()
    if (password !== '891025') {
      setError(true)
      return
    }
    finish(true)
  }

  return (
    <EditAuthorizationContext.Provider value={requestAuthorization}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/35 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) finish(false) }}>
          <form onSubmit={verify} className="tool-panel-light dark:tool-panel-dark w-full max-w-sm rounded-2xl border border-[var(--tool-border)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 font-semibold text-[var(--tool-text)]"><LockKeyhole size={17} />验证编辑密码</div>
            <input autoFocus type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="请输入密码" aria-label="编辑密码" className="w-full rounded-xl border border-[var(--tool-border)] bg-[var(--tool-background)] px-3 py-2.5 text-sm text-[var(--tool-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]" />
            {error && <p className="mt-2 text-xs text-red-500">密码错误，请重试。</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => finish(false)} className="rounded-lg px-3 py-2 text-sm text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)]">取消</button>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--tool-brand)] px-3 py-2 text-sm font-semibold text-white"><Check size={15} />验证并继续</button>
            </div>
          </form>
        </div>
      )}
    </EditAuthorizationContext.Provider>
  )
}
