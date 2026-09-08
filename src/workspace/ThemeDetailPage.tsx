import React, { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getDefaultComponent } from '@tools/config/pages'
import { getThemeInfo, themeDesignDocs, themeModules } from '@tools/config/themes'
import MarkdownDocument from '@tools/components/MarkdownDocument'

export const ThemeDetailPage: React.FC = () => {
  const { themeId } = useParams<{ themeId: string }>()
  const [ThemeComponent, setThemeComponent] = useState<React.ComponentType | null>(null)
  const [designDoc, setDesignDoc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      setLoading(true)
      const themePath = Object.keys(themeModules).find(path => {
        const match = path.match(/\.\.\/\.\.\/src\/themes\/([^/]+)\//)
        return match && match[1] === themeId
      })

      const tasks: Promise<void>[] = []

      if (themePath) {
        tasks.push(
          themeModules[themePath]().then(mod => {
            setThemeComponent(() => getDefaultComponent(mod))
          })
        )
      } else {
        setThemeComponent(null)
      }

      const docKey = `../../src/themes/${themeId}/DESIGN.md`
      const loader = themeDesignDocs[docKey]
      if (loader) {
        tasks.push(
          loader().then((content) => {
            setDesignDoc(content as string)
          }).catch(() => {
            setDesignDoc('无法加载设计文档。')
          })
        )
      } else {
        setDesignDoc('暂无设计文档。')
      }

      await Promise.all(tasks)
      setLoading(false)
    }
    loadTheme()
  }, [themeId])

  const info = themeId ? getThemeInfo(themeId) : { name: '未知主题', description: '' }

  return (
    <div className="h-full flex flex-col bg-[var(--tool-background)] text-[var(--tool-text)]">
      <div className="bg-[var(--tool-surface)] border-b border-[var(--tool-border)] px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-[var(--tool-text-muted)] mb-2">
          <NavLink to="/themes" className="hover:text-[var(--tool-brand)]">主题列表</NavLink>
          <ChevronRight size={14} />
          <span className="text-[var(--tool-text)]">{info.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--tool-text)]">{info.name}</h1>
            <p className="text-sm text-[var(--tool-text-muted)] mt-1">{info.description}</p>
          </div>
          <NavLink
            to="/themes"
            className="px-4 py-2 text-sm text-[var(--tool-text-muted)] hover:text-[var(--tool-text)] hover:bg-[var(--tool-surface-hover)] rounded-lg transition-colors"
          >
            返回主题列表
          </NavLink>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-[var(--tool-surface)] rounded-lg shadow-sm border border-[var(--tool-border)] p-6 min-h-[600px]">
            <h2 className="text-lg font-medium text-[var(--tool-text)] mb-4">主题预览</h2>
            {ThemeComponent ? React.createElement(ThemeComponent) : <div className="text-[var(--tool-text-muted)]">主题组件加载失败</div>}
          </div>
        </div>

        <div className="w-[400px] border-l border-[var(--tool-border)] bg-[var(--tool-surface)] overflow-auto">
          <div className="p-4 border-b border-[var(--tool-border)]">
            <h3 className="font-medium text-[var(--tool-text)]">设计规范</h3>
            <p className="text-xs text-[var(--tool-text-muted)] mt-1">{themeId}/DESIGN.md</p>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin w-5 h-5 border-2 border-[var(--tool-brand)] border-t-transparent rounded-full" />
              </div>
            ) : designDoc ? (
              <MarkdownDocument content={designDoc} />
            ) : (
              <div className="text-[var(--tool-text-subtle)] text-center py-10">暂无设计文档</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
