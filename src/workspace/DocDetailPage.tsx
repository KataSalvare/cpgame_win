import React, { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { docModules } from '@tools/config/docs'
import MarkdownDocument from '@tools/components/MarkdownDocument'

export const DocDetailPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true)
      const docKey = `../../src/docs/${docId}.md`
      const loader = docModules[docKey]
      if (loader) {
        try {
          const docContent = await loader() as string
          setContent(docContent)
        } catch {
          setContent('无法加载文档内容。')
        }
      } else {
        setContent('文档不存在。')
      }
      setLoading(false)
    }
    loadDoc()
  }, [docId])

  return (
    <div className="h-full flex flex-col bg-[var(--tool-surface)] text-[var(--tool-text)]">
      <div className="border-b border-[var(--tool-border)] px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-[var(--tool-text-muted)] mb-2">
          <NavLink to="/docs" className="hover:text-[var(--tool-brand)]">文档</NavLink>
          <ChevronRight size={14} />
          <span className="text-[var(--tool-text)]">{docId}</span>
        </div>
        <h1 className="text-xl font-semibold text-[var(--tool-text)]">{docId}</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-6 h-6 border-2 border-[var(--tool-brand)] border-t-transparent rounded-full" />
            </div>
          ) : content ? (
            <MarkdownDocument content={content} />
          ) : (
            <div className="text-[var(--tool-text-subtle)] text-center py-20">文档加载失败</div>
          )}
        </div>
      </div>
    </div>
  )
}
