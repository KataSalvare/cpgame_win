import { RightDrawer, type RightDrawerProps } from '@/components/WindowsClient'
import './side-drawer.css'

/** Shared third-column drawer. The caller owns its contents and open state. */
export function SideDrawer(props: RightDrawerProps) {
  return <RightDrawer {...props} className={`theme-side-drawer ${props.className ?? ''}`.trim()} />
}
