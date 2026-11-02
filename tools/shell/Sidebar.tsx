import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { ChevronDown, ChevronsDown, ChevronsUp, FileText, Maximize2, Minimize2, Monitor, Palette, Pencil, Search, Smartphone, XIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { pages, type PageCategory } from '../config/pages'
import { docModules } from '../config/docs'
import { getThemeInfo, themeModules } from '../config/themes'
import { loadMenuTree, loadMenuTreeFromFile, moveMenuNode, renameMenuNode, saveMenuTree, type MenuNode } from '../lib/menuTree'
import { useEditAuthorization } from '../components/editAuthorizationContext'

interface SidebarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  collapsed: boolean
}

interface PageListProps {
  filteredPages: typeof pages
  icon: typeof Smartphone
  tree: MenuNode[]
  onMove: (draggedId: string, targetId: string, placement: 'before' | 'after' | 'inside') => void
  expanded: Set<string>
  onToggle: (id: string) => void
  onRename: (id: string, label: string) => void
  onToggleAll: (open: boolean) => void
  dragEnabled: boolean
}

const PageList = ({ filteredPages, icon: Icon, tree, onMove, expanded, onToggle, onRename, onToggleAll, dragEnabled }: PageListProps) => {
  const requestAuthorization = useEditAuthorization()
  const [dropTarget, setDropTarget] = useState<{ id: string; placement: 'before' | 'after' | 'inside' } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const contextRef = useRef<HTMLDivElement>(null)
  const pointerDrag = useRef<{ id: string; pointerId: number; startX: number; startY: number; active: boolean; authorizationPending: boolean } | null>(null)
  const suppressClick = useRef(false)
  const pagesById = useMemo(() => new Map(pages.map(page => [page.path, page])), [])
  const allowedIds = useMemo(() => new Set(filteredPages.map(page => page.path)), [filteredPages])
  const visibleTree = useMemo(() => {
    const filter = (nodes: MenuNode[]): MenuNode[] => nodes.flatMap(node => {
      const children = filter(node.children)
      const page = pages.find(item => item.path === node.id)
      return page && (allowedIds.has(node.id) || children.length) ? [{ ...node, children }] : []
    })
    return filter(tree)
  }, [tree, allowedIds])

  useEffect(() => {
    if (!contextMenu) return
    const dismiss = (event: MouseEvent) => {
      if (event.target instanceof Node && !contextRef.current?.contains(event.target)) setContextMenu(null)
    }
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') setContextMenu(null) }
    window.addEventListener('pointerdown', dismiss)
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('keydown', keydown)
    }
  }, [contextMenu])

  const getDropTarget = (clientX: number, clientY: number, sourceId: string) => {
    const element = document.elementFromPoint(clientX, clientY)
    const row = element instanceof Element ? element.closest<HTMLElement>('[data-menu-id]') : null
    if (!row || row.dataset.menuId === sourceId) return null
    const bounds = row.getBoundingClientRect()
    const ratio = (clientY - bounds.top) / bounds.height
    return { id: row.dataset.menuId as string, placement: (ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside') as 'before' | 'after' | 'inside' }
  }

  const clearPointerDrag = () => {
    pointerDrag.current = null
    setDropTarget(null)
  }

  const renderNodes = (nodes: MenuNode[], depth = 0): React.ReactNode => nodes.map((node) => {
    const page = pagesById.get(node.id) ?? pages.find(item => item.path === node.id)
    if (!page) return null
    const PageIcon = page.entryView === 'global-search' ? Search : page.entryView === 'voice-room-minimized' ? Minimize2 : Icon
    const label = node.label || page.label
    const hasChildren = node.children.length > 0
    const isOpen = expanded.has(node.id)
    const placement = dropTarget?.id === node.id ? dropTarget.placement : null
    return (
      <div key={node.id}>
        <div
          className={`group relative flex items-center rounded-xl ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''} ${placement === 'inside' ? 'ring-1 ring-[var(--tool-focus)] bg-[var(--tool-surface-hover)]' : ''} ${placement === 'before' ? 'before:absolute before:inset-x-2 before:top-0 before:border-t-2 before:border-[var(--tool-focus)]' : ''} ${placement === 'after' ? 'after:absolute after:inset-x-2 after:bottom-0 after:border-b-2 after:border-[var(--tool-focus)]' : ''}`}
          style={{ marginLeft: depth * 14 }}
          data-menu-id={node.id}
          onContextMenu={(event) => {
            event.preventDefault()
            setContextMenu({ id: node.id, x: Math.min(event.clientX, window.innerWidth - 190), y: Math.min(event.clientY, window.innerHeight - 360) })
          }}
          onPointerDown={(event) => {
            if (!dragEnabled || event.button !== 0 || (event.target as HTMLElement).closest('button')) return
            pointerDrag.current = { id: node.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, active: false, authorizationPending: false }
          }}
          onPointerMove={async (event) => {
            const drag = pointerDrag.current
            if (!drag || drag.pointerId !== event.pointerId) return
            if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return
            if (!drag.active) {
              if (drag.authorizationPending) return
              drag.authorizationPending = true
              const row = event.currentTarget
              const pointerId = event.pointerId
              const clientX = event.clientX
              const clientY = event.clientY
              if (!await requestAuthorization()) {
                if (pointerDrag.current === drag) clearPointerDrag()
                return
              }
              if (pointerDrag.current !== drag) return
              drag.active = true
              suppressClick.current = true
              row.setPointerCapture(pointerId)
              setDropTarget(getDropTarget(clientX, clientY, drag.id))
              return
            }
            event.preventDefault()
            setDropTarget(getDropTarget(event.clientX, event.clientY, drag.id))
          }}
          onPointerUp={(event) => {
            const drag = pointerDrag.current
            if (!drag || drag.pointerId !== event.pointerId) return
            if (drag.active) {
              const target = getDropTarget(event.clientX, event.clientY, drag.id)
              if (target) onMove(drag.id, target.id, target.placement)
              window.setTimeout(() => { suppressClick.current = false }, 0)
            }
            clearPointerDrag()
          }}
          onPointerCancel={clearPointerDrag}
          onClickCapture={(event) => {
            if (!suppressClick.current) return
            event.preventDefault()
            event.stopPropagation()
            suppressClick.current = false
          }}
        >
          <NavLink
            draggable={false}
            to={`${page.path}${page.defaultHash ?? ''}`}
            title={label}
            className={({ isActive }) => `flex min-w-0 flex-1 items-center gap-2.5 px-2 py-2 rounded-xl text-xs leading-5 tool-control ${isActive ? 'tool-menu-active-light dark:tool-menu-active-dark' : 'text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'}`}
          >
            {({ isActive }) => <><PageIcon size={15} className="shrink-0 opacity-80" />{editingId === node.id ? <input autoFocus value={editingLabel} aria-label="导航名称" onChange={event => setEditingLabel(event.target.value)} onClick={event => event.preventDefault()} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); onRename(node.id, editingLabel); setEditingId(null) } if (event.key === 'Escape') { event.preventDefault(); setEditingId(null) } }} onBlur={() => { if (editingId === node.id) { onRename(node.id, editingLabel); setEditingId(null) } }} className="min-w-0 flex-1 bg-transparent text-xs outline-none border-b border-[var(--tool-focus)]" /> : <span className="truncate font-medium">{label}</span>}{isActive && <span className="sr-only">当前页面</span>}</>}
          </NavLink>
          {hasChildren && <button type="button" aria-label={`${isOpen ? '折叠' : '展开'}${label}`} onClick={() => onToggle(node.id)} className="mr-1 rounded p-1 text-[var(--tool-text-subtle)] hover:bg-[var(--tool-surface-hover)]"><ChevronDown size={13} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} /></button>}
        </div>
        {contextMenu?.id === node.id && <div ref={contextRef} role="menu" className="fixed z-[1200] min-w-44 rounded-lg border border-[var(--tool-border)] bg-[var(--tool-surface-raised)] p-1 shadow-xl" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {hasChildren && <button role="menuitem" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs text-[var(--tool-text)] hover:bg-[var(--tool-surface-hover)]" onClick={() => { onToggle(node.id); setContextMenu(null) }}>{isOpen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}{isOpen ? '折叠当前' : '展开当前'}</button>}
          <button role="menuitem" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs text-[var(--tool-text)] hover:bg-[var(--tool-surface-hover)]" onClick={() => { onToggleAll(false); setContextMenu(null) }}><ChevronsDown size={14} />折叠全部</button>
          <button role="menuitem" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs text-[var(--tool-text)] hover:bg-[var(--tool-surface-hover)]" onClick={() => { onToggleAll(true); setContextMenu(null) }}><ChevronsUp size={14} />展开全部</button>
          <button role="menuitem" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs text-[var(--tool-text)] hover:bg-[var(--tool-surface-hover)]" onClick={() => { setEditingLabel(label); setEditingId(node.id); setContextMenu(null) }}><Pencil size={14} />重命名</button>
        </div>}
        {hasChildren && isOpen && <div className="mt-0.5 space-y-0.5 border-l border-[var(--tool-border)] ml-3">{renderNodes(node.children, depth + 1)}</div>}
      </div>
    )
  })
  return (
    <div className="space-y-0.5">{renderNodes(visibleTree)}</div>
  )
}

interface ThemeNavProps {
  searchQuery: string
}

const ThemeNav = ({ searchQuery }: ThemeNavProps) => {
  const themes = useMemo(() => Object.keys(themeModules).map((path) => {
      const match = path.match(/\.\.\/\.\.\/src\/themes\/([^/]+)\//)
      if (match) {
        const dirName = match[1]
        const info = getThemeInfo(dirName)
        return { id: dirName, name: info.name, description: info.description }
      }
      return null
    }).filter(Boolean) as { id: string; name: string; description: string }[], [])

  const filteredThemes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return query
      ? themes.filter(theme => theme.name.toLowerCase().includes(query) || theme.description.toLowerCase().includes(query))
      : themes
  }, [searchQuery, themes])

  return (
    <div className="space-y-0.5">
      <div className="px-3 py-2 tool-section-label">
        设计系统主题
      </div>
      {filteredThemes.map((theme) => (
        <NavLink
          key={theme.id}
          to={`/theme/${theme.id}`}
          title={theme.name}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2 rounded-xl text-xs leading-5 tool-control ${
              isActive
                ? 'tool-menu-active-light dark:tool-menu-active-dark'
                : 'text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-[var(--tool-brand)]/10' : 'bg-[var(--tool-surface-muted)]'}`}>
                <Palette size={13} className={isActive ? 'tool-accent' : ''} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="truncate font-medium">{theme.name}</span>
                <span className="text-[11px] leading-4 text-[var(--tool-text-subtle)]">{theme.description}</span>
              </div>
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

interface DocNavProps {
  searchQuery: string
}

const DocNav = ({ searchQuery }: DocNavProps) => {
  const docs = useMemo(() => Object.entries(docModules).map(([path]) => {
      const match = path.match(/\.\.\/\.\.\/src\/docs\/(.+)\.md$/)
      if (match) {
        const fileName = match[1]
        return { id: fileName, name: fileName, path: `/doc/${fileName}` }
      }
      return null
    }).filter(Boolean) as { id: string; name: string; path: string }[], [])

  const filteredDocs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return query ? docs.filter(doc => doc.name.toLowerCase().includes(query)) : docs
  }, [docs, searchQuery])

  return (
    <div className="space-y-0.5">
      <div className="px-3 py-2 tool-section-label">
        项目文档
      </div>
      {filteredDocs.map((doc) => (
        <NavLink
          key={doc.id}
          to={doc.path}
          title={doc.name}
          className={({ isActive }) =>
            `group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs leading-5 tool-control ${
              isActive
                ? 'tool-menu-active-light dark:tool-menu-active-dark'
                : 'text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FileText size={15} className={isActive ? 'tool-accent' : ''} />
              <span className="truncate font-medium">{doc.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export const Sidebar = ({ projectName, onProjectNameChange, collapsed }: SidebarProps) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(projectName)
  const [activeTab, setActiveTab] = useState<PageCategory | 'themes' | 'docs'>('frontend')
  const [searchQuery, setSearchQuery] = useState('')
  const menuIdsByCategory = useMemo(() => ({
    frontend: pages.filter(page => page.category === 'frontend').map(page => page.path),
    admin: pages.filter(page => page.category === 'admin').map(page => page.path),
  }), [])
  const [menuTree, setMenuTree] = useState(() => loadMenuTree(menuIdsByCategory))
  const [menuTreeReady, setMenuTreeReady] = useState(false)
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    const collectExpandable = (nodes: MenuNode[]) => nodes.forEach(node => {
      if (node.children.length) ids.add(node.id)
      collectExpandable(node.children)
    })
    Object.values(menuTree).forEach(collectExpandable)
    return ids
  })

  useEffect(() => {
    let cancelled = false
    loadMenuTreeFromFile(menuIdsByCategory).then((tree) => {
      if (cancelled) return
      setMenuTree(tree)
      const expanded = new Set<string>()
      const collectExpandable = (nodes: MenuNode[]) => nodes.forEach(node => {
        if (node.children.length) expanded.add(node.id)
        collectExpandable(node.children)
      })
      Object.values(tree).forEach(collectExpandable)
      setExpandedMenuIds(expanded)
      setMenuTreeReady(true)
    }).catch((error) => {
      if (cancelled) return
      console.error('菜单文件加载失败，暂用浏览器缓存：', error)
      setMenuTreeReady(true)
    })
    return () => { cancelled = true }
  }, [menuIdsByCategory])

  useEffect(() => {
    if (!menuTreeReady) return
    saveMenuTree(menuTree).catch((error) => console.error('菜单文件保存失败：', error))
  }, [menuTree, menuTreeReady])

  const handleMenuMove = (category: PageCategory, draggedId: string, targetId: string, placement: 'before' | 'after' | 'inside') => {
    setMenuTree(current => moveMenuNode(current, category, draggedId, targetId, placement))
    if (placement === 'inside') setExpandedMenuIds(current => new Set(current).add(targetId))
  }
  const toggleMenuNode = (id: string) => setExpandedMenuIds(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const renameMenuItem = (category: PageCategory, id: string, label: string) => setMenuTree(current => renameMenuNode(current, category, id, label))
  const toggleAllMenuNodes = (open: boolean) => {
    const ids = new Set<string>()
    const collect = (nodes: MenuNode[]) => nodes.forEach(node => { if (node.children.length) ids.add(node.id); collect(node.children) })
    collect(menuTree[activeTab as PageCategory] ?? [])
    setExpandedMenuIds(current => {
      const next = new Set(current)
      ids.forEach(id => open ? next.add(id) : next.delete(id))
      return next
    })
  }

  const filteredPages = useMemo(() => {
    const categoryPages = pages.filter(p => p.category === activeTab as PageCategory)
    const query = searchQuery.trim().toLowerCase()
    if (!query) return categoryPages
    return categoryPages.filter(p => p.label.toLowerCase().includes(query))
  }, [activeTab, searchQuery])

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onProjectNameChange(tempName.trim())
    } else {
      setTempName(projectName)
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setTempName(projectName)
      setIsEditingName(false)
    }
  }

  const tabs = [
    { key: 'frontend' as const, label: '前端', icon: Smartphone },
    { key: 'admin' as const, label: '后台', icon: Monitor },
    { key: 'themes' as const, label: '主题', icon: Palette },
    { key: 'docs' as const, label: '文档', icon: FileText },
  ]

  return (
    <aside
      className={`flex flex-col h-screen z-[1000] transition-[width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-[260px] opacity-100'
      } tool-surface-light dark:tool-surface-dark shadow-[8px_0_24px_color-mix(in_srgb,var(--tool-text)_4%,transparent)]`}
    >
      {!collapsed && (
        <>
          <div className="flex items-center px-4 py-4 bg-[color-mix(in_srgb,var(--tool-surface)_72%,transparent)]">
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="w-full text-sm font-bold bg-transparent border-b-2 border-[var(--tool-brand)] text-[var(--tool-text)] placeholder-[var(--tool-text-subtle)] outline-none transition-colors"
                  placeholder="输入项目名称"
                />
              ) : (
                <h1 className="min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(projectName)
                      setIsEditingName(true)
                    }}
                    title="点击编辑项目名称"
                    className="w-full truncate text-left text-sm font-bold text-[var(--tool-text)] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]"
                  >
                    {projectName}
                  </button>
                </h1>
              )}
              <p className="text-[10px] mt-1 uppercase tracking-[0.16em] text-[var(--tool-text-subtle)]">
                Prototype Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-2.5" role="tablist" aria-label="内容分类">
            {tabs.map(tab => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium rounded-xl tool-control ${
                    isActive
                      ? 'tool-menu-active-light dark:tool-menu-active-dark'
                      : 'text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'
                  }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--tool-border)] bg-[var(--tool-surface-raised)] tool-control focus-within:border-[var(--tool-focus)] focus-within:tool-focus-ring">
              <Search size={14} className="text-[var(--tool-text-subtle)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索..."
                aria-label="搜索当前分类"
                className="flex-1 bg-transparent text-xs text-[var(--tool-text)] placeholder-[var(--tool-text-subtle)] outline-none min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded-md text-[var(--tool-text-subtle)] transition-colors hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]"
                >
                  <XIcon size={12} />
                </button>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="原型工作区导航">
            {activeTab === 'frontend' && (
              <PageList filteredPages={filteredPages} icon={Smartphone} tree={menuTree.frontend ?? []} expanded={expandedMenuIds} onToggle={toggleMenuNode} onToggleAll={toggleAllMenuNodes} onRename={(id, label) => renameMenuItem('frontend', id, label)} onMove={(dragged, target, placement) => handleMenuMove('frontend', dragged, target, placement)} dragEnabled={menuTreeReady} />
            )}
            {activeTab === 'admin' && (
              <PageList filteredPages={filteredPages} icon={Monitor} tree={menuTree.admin ?? []} expanded={expandedMenuIds} onToggle={toggleMenuNode} onToggleAll={toggleAllMenuNodes} onRename={(id, label) => renameMenuItem('admin', id, label)} onMove={(dragged, target, placement) => handleMenuMove('admin', dragged, target, placement)} dragEnabled={menuTreeReady} />
            )}
            {activeTab === 'themes' && (
              <ThemeNav searchQuery={searchQuery} />
            )}
            {activeTab === 'docs' && (
              <DocNav searchQuery={searchQuery} />
            )}
          </nav>
        </>
      )}
    </aside>
  )
}
