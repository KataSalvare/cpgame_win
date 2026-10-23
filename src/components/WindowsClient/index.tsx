import type { CSSProperties, ReactNode } from 'react'
import { X, Minus, Square } from 'lucide-react'
import './style.css'

export interface WindowsClientFrameProps {
  titleBar: ReactNode
  sidebar: ReactNode
  children: ReactNode
  navigationPanel?: ReactNode
  navigationPanelWidth?: CSSProperties['width']
  rightPanel?: ReactNode
  rightPanelWidth?: CSSProperties['width']
  contentMaxWidth?: CSSProperties['maxWidth']
  overlayLayer?: ReactNode
  className?: string
}

export function WindowsClientFrame({
  titleBar,
  sidebar,
  children,
  navigationPanel,
  navigationPanelWidth = 240,
  rightPanel,
  rightPanelWidth = 360,
  contentMaxWidth,
  overlayLayer,
  className = '',
}: WindowsClientFrameProps) {
  return <div className={`windows-client-frame ${className}`.trim()}>
    <div className="windows-client-frame__titlebar">{titleBar}</div>
    <div className="windows-client-frame__body">
      <aside className="windows-client-frame__sidebar">{sidebar}</aside>
      {navigationPanel && <aside className="windows-client-frame__navigation-panel" style={{ width: navigationPanelWidth, flexBasis: navigationPanelWidth }}>{navigationPanel}</aside>}
      <div className="windows-client-frame__workspace">
        <main className="windows-client-frame__main">
          {contentMaxWidth !== undefined
            ? <div className="windows-client-frame__content" style={{ maxWidth: contentMaxWidth }}>{children}</div>
            : children}
        </main>
        {rightPanel && <aside className="windows-client-frame__right-panel" style={{ width: rightPanelWidth, flexBasis: rightPanelWidth }}>{rightPanel}</aside>}
      </div>
    </div>
    {overlayLayer}
  </div>
}

export interface WindowsTitleBarProps {
  title: string
  leading?: ReactNode
  actions?: ReactNode
  showWindowControls?: boolean
  className?: string
}

export function WindowsTitleBar({ title, leading, actions, showWindowControls = true, className = '' }: WindowsTitleBarProps) {
  return <header className={`windows-titlebar ${className}`.trim()}>
    <div className="windows-titlebar__identity">{leading}<span>{title}</span></div>
    {actions && <div className="windows-titlebar__actions">{actions}</div>}
    {showWindowControls && <WindowsControlButtons />}
  </header>
}

export interface WindowsControlButtonsProps {
  className?: string
}

export function WindowsControlButtons({ className = '' }: WindowsControlButtonsProps) {
  return <div className={`windows-control-buttons ${className}`.trim()} aria-label="窗口控制按钮（仅示意）">
    <span className="windows-control-buttons__button" aria-label="最小化"><Minus size={14} strokeWidth={1.5} /></span>
    <span className="windows-control-buttons__button" aria-label="最大化"><Square size={11} strokeWidth={1.5} /></span>
    <span className="windows-control-buttons__button windows-control-buttons__button--close" aria-label="关闭"><X size={14} strokeWidth={1.5} /></span>
  </div>
}

export interface WindowsSidebarItem {
  id: string
  label: string
  icon?: ReactNode
  group?: string
}

export interface WindowsSidebarProps {
  items: readonly WindowsSidebarItem[]
  activeId: string
  onSelect: (id: string) => void
  heading?: string
  footer?: ReactNode
  className?: string
}

export function WindowsSidebar({ items, activeId, onSelect, heading, footer, className = '' }: WindowsSidebarProps) {
  const groups = [...new Set(items.map((item) => item.group ?? ''))]
  return <nav className={`windows-sidebar ${className}`.trim()} aria-label={heading ?? '主导航'}>
    {heading && <div className="windows-sidebar__heading">{heading}</div>}
    <div className="windows-sidebar__items">
      {groups.map((group) => <section className="windows-sidebar__group" key={group || 'default'}>
        {group && <h2 className="windows-sidebar__group-title">{group}</h2>}
        {items.filter((item) => (item.group ?? '') === group).map((item) => <button
          type="button"
          key={item.id}
          className={`windows-sidebar__item${activeId === item.id ? ' is-active' : ''}`}
          aria-current={activeId === item.id ? 'page' : undefined}
          onClick={() => onSelect(item.id)}
        >{item.icon && <span className="windows-sidebar__icon" aria-hidden="true">{item.icon}</span>}<span>{item.label}</span></button>)}
      </section>)}
    </div>
    {footer && <div className="windows-sidebar__footer">{footer}</div>}
  </nav>
}

export interface FloatingPanelProps {
  children: ReactNode
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  width?: number | string
  className?: string
  style?: CSSProperties
}

export function FloatingPanel({ children, placement = 'bottom-end', width = 320, className = '', style }: FloatingPanelProps) {
  return <div className={`windows-floating-panel windows-floating-panel--${placement} ${className}`.trim()} style={{ ...style, width }}>
    {children}
  </div>
}

export interface DialogPanelProps {
  overlayId: string
  children: ReactNode
  title?: string
  description?: string
  footer?: ReactNode
  onClose?: () => void
  width?: number | string
  className?: string
}

export function DialogPanel({ overlayId, children, title, description, footer, onClose, width = 560, className = '' }: DialogPanelProps) {
  return <div className="windows-dialog-overlay" data-overlay={overlayId}>
    <section className={`windows-dialog-panel ${className}`.trim()} style={{ width }} role="dialog" aria-modal="true" aria-labelledby={title ? `${overlayId}-title` : undefined}>
      {(title || onClose) && <header className="windows-dialog-panel__header">
        <div>{title && <h2 id={`${overlayId}-title`}>{title}</h2>}{description && <p>{description}</p>}</div>
        {onClose && <button type="button" className="windows-icon-button" aria-label="关闭弹窗" onClick={onClose}><X size={16} /></button>}
      </header>}
      <div className="windows-dialog-panel__content">{children}</div>
      {footer && <footer className="windows-dialog-panel__footer">{footer}</footer>}
    </section>
  </div>
}

type RightDrawerCommonProps = {
  children: ReactNode
  title?: string
  description?: string
  onClose?: () => void
  className?: string
}

export type RightDrawerProps = RightDrawerCommonProps & (
  | { mode: 'overlay'; overlayId: string; width?: number | string }
  | { mode: 'inline'; overlayId?: never; width?: number | string }
)

export function RightDrawer(props: RightDrawerProps) {
  const { children, title, description, onClose, className = '', width = 360 } = props
  const panel = <section className={`windows-right-drawer__panel${props.mode === 'inline' ? ' is-inline' : ''} ${className}`.trim()} style={{ width }}>
    {(title || onClose) && <header className="windows-right-drawer__header">
      <div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>
      {onClose && <button type="button" className="windows-icon-button" aria-label="关闭侧栏" onClick={onClose}><X size={16} /></button>}
    </header>}
    <div className="windows-right-drawer__content">{children}</div>
  </section>

  if (props.mode === 'inline') return <aside className="windows-right-drawer windows-right-drawer--inline">{panel}</aside>
  return <div className="windows-right-drawer windows-right-drawer--overlay" data-overlay={props.overlayId}>
    <div className="windows-right-drawer__scrim" aria-hidden="true" />{panel}
  </div>
}

export type NotificationVariant = 'neutral' | 'success' | 'warning' | 'error'

export interface NotificationToastProps {
  variant?: NotificationVariant
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
}

export function NotificationToast({ variant = 'neutral', title, message, onDismiss, className = '' }: NotificationToastProps) {
  const labels: Record<NotificationVariant, string> = { neutral: '通知', success: '成功', warning: '注意', error: '错误' }
  return <div className={`windows-notification-toast windows-notification-toast--${variant} ${className}`.trim()} role="status">
    <span className="windows-notification-toast__marker" aria-hidden="true" />
    <div className="windows-notification-toast__body"><span className="windows-notification-toast__label">{title ?? labels[variant]}</span><p>{message}</p></div>
    {onDismiss && <button type="button" className="windows-icon-button" aria-label="关闭通知" onClick={onDismiss}><X size={15} /></button>}
  </div>
}
