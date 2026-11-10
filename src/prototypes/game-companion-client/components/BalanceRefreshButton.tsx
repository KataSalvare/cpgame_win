import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

export function BalanceRefreshButton() {
  const [refreshed, setRefreshed] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const refresh = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setRefreshed(true)
    timer.current = window.setTimeout(() => setRefreshed(false), 1200)
  }

  return <button type="button" className="balance-refresh-button" aria-label={refreshed ? '余额已更新' : '刷新余额'} title={refreshed ? '余额已更新（演示）' : '刷新余额'} onClick={refresh}>
    <RefreshCw size={14} className={refreshed ? 'is-refreshing' : undefined} />
  </button>
}
