import React from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronRight, Palette } from 'lucide-react'
import { getThemeInfo, themeModules } from '@tools/config/themes'

export const ThemesListPage: React.FC = () => {
  const themes = Object.keys(themeModules).map((path) => {
    const match = path.match(/\.\.\/\.\.\/src\/themes\/([^/]+)\//)
    if (match) {
      const dirName = match[1]
      const info = getThemeInfo(dirName)
      return { id: dirName, name: info.name, description: info.description }
    }
    return null
  }).filter(Boolean) as { id: string; name: string; description: string }[]

  return (
    <div className="h-full overflow-auto p-8 bg-[var(--tool-background)] text-[var(--tool-text)]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--tool-text)]">主题设计系统</h1>
          <p className="text-[var(--tool-text-muted)] mt-2">管理和预览项目中的设计系统主题</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(theme => (
            <NavLink
              key={theme.id}
              to={`/theme/${theme.id}`}
              className="block bg-[var(--tool-surface)] rounded-xl shadow-sm border border-[var(--tool-border)] hover:shadow-md hover:border-[var(--tool-brand)] transition-all p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tool-focus)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--tool-brand)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Palette className="text-white" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--tool-text)]">{theme.name}</h3>
                  <p className="text-sm text-[var(--tool-text-muted)] mt-1">{theme.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-[var(--tool-surface-muted)] text-[var(--tool-text-muted)] rounded">{theme.id}</span>
                  </div>
                </div>
                <ChevronRight className="text-[var(--tool-text-subtle)] flex-shrink-0" size={20} />
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
