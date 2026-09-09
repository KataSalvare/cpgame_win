import { useMemo, useState } from 'react'
import { FileText, Monitor, Palette, Smartphone, XIcon, Search, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { pages, type PageCategory } from '../config/pages'
import { docModules } from '../config/docs'
import { getThemeInfo, themeModules } from '../config/themes'

interface SidebarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  collapsed: boolean
}

interface PageListProps {
  filteredPages: typeof pages
  icon: typeof Smartphone
}

const PageList = ({ filteredPages, icon: Icon }: PageListProps) => {
  return (
    <div className="space-y-0.5">
      {filteredPages.map((page) => (
        <NavLink
          key={page.path}
          to={page.path}
          title={page.label}
          className={({ isActive }) =>
            `group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs leading-5 tool-control ${
              isActive
                ? 'tool-menu-active-light dark:tool-menu-active-dark'
                : 'text-[var(--tool-text-muted)] hover:bg-[var(--tool-surface-hover)] hover:text-[var(--tool-text)]'
            }`
          }
        >
          <Icon size={15} className="opacity-80" />
          <span className="truncate font-medium">{page.label}</span>
          <ChevronRight size={12} className="ml-auto opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </NavLink>
      ))}
    </div>
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
              <PageList filteredPages={filteredPages} icon={Smartphone} />
            )}
            {activeTab === 'admin' && (
              <PageList filteredPages={filteredPages} icon={Monitor} />
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
