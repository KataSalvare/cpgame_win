import React, { useState } from 'react';

// ==================== Types ====================

interface SourceInfo {
  sourceName?: string;
  originalDetailUrl?: string;
  fallbackRawUrl?: string;
  mirrorSource?: string;
  websiteUrl?: string;
}

interface PaletteItem {
  color: string;
  labelZh: string;
  labelEn: string;
  textColor: string;
}

interface PreviewImage {
  type: string;
  url?: string;
  path?: string;
}

interface UsageGuidance {
  do: string[];
  dont: string[];
}

interface ShadowInfo {
  label: string;
  value: string;
  cssValue: string;
  description?: string;
}

interface BorderInfo {
  label: string;
  value: string;
  cssValue: string;
  description?: string;
}

interface PanelInfo {
  eyebrow: string;
  title: string;
  body: string;
}

interface RadiusInfo {
  control?: string;
  card?: string;
  preview?: string;
  pill?: string;
  source?: string;
}

interface SpacingInfo {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  section?: string;
  source?: string;
}

export interface BatchShowcaseConfig {
  brand: string;
  brandAlias: string;
  source?: SourceInfo;
  description: string;
  descriptionEn: string;
  variant: string;
  distributionTags: string[];
  fontStylesheets: string[];
  palette: PaletteItem[];
  radius?: RadiusInfo;
  spacing?: SpacingInfo;
  typography: string[];
  previewImages: PreviewImage[];
  usageGuidance?: UsageGuidance;
  shadows: ShadowInfo[];
  borders: BorderInfo[];
  panels: PanelInfo[];
}

export interface BatchShowcaseTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

// ==================== Components ====================

const ColorSwatch: React.FC<{ item: PaletteItem }> = ({ item }) => (
  <div className="rounded-lg overflow-hidden border border-gray-200">
    <div className="h-16 flex items-end p-2" style={{ backgroundColor: item.color }}>
      <span
        className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm"
        style={{ color: item.color }}
      >
        {item.color}
      </span>
    </div>
    <div className="p-2 bg-white">
      <p className="text-xs font-medium text-gray-900">{item.labelZh}</p>
      <p className="text-xs text-gray-500">{item.labelEn}</p>
    </div>
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
    {children}
  </span>
);

// ==================== Main Component ====================

interface DesignMdBatchShowcaseProps {
  config: BatchShowcaseConfig;
  tabs?: BatchShowcaseTab[];
}

export const DesignMdBatchShowcase: React.FC<DesignMdBatchShowcaseProps> = ({ config, tabs }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs?.[0]?.id || 'overview');
  const hasTabs = tabs && tabs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{config.brand}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {config.variant}
                </span>
              </div>
              <p className="text-gray-500 max-w-2xl">{config.description}</p>
              {config.source && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">来源: {config.source.sourceName}</span>
                  {config.source.websiteUrl && (
                    <a
                      href={config.source.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      官网
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {config.distributionTags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      {hasTabs && (
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {hasTabs && activeTab !== 'overview' ? (
          /* Tab Content */
          <div>
            {tabs.find(t => t.id === activeTab)?.content}
          </div>
        ) : (
          /* Overview Content */
          <div className="space-y-10">
            {/* Preview Images */}
            {config.previewImages.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">预览</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.previewImages.map((img, i) => (
                    <div key={i} className="rounded-lg border bg-white overflow-hidden">
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={`Preview ${i + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto"
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                          预览图不可用
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Color Palette */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">调色板</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {config.palette.map((item, i) => (
                  <ColorSwatch key={i} item={item} />
                ))}
              </div>
            </section>

            {/* Typography */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">字体</h2>
              <div className="flex flex-wrap gap-2">
                {config.typography.map((font, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-white rounded-lg border text-sm text-gray-700"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </span>
                ))}
              </div>
            </section>

            {/* Radius & Spacing */}
            {(config.radius || config.spacing) && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">尺寸规范</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {config.radius && (
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">圆角</h3>
                      <div className="space-y-2">
                        {Object.entries(config.radius).map(([key, val]) => (
                          val && key !== 'source' ? (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">{key}</span>
                              <span className="text-gray-900 font-mono">{val}</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                  {config.spacing && (
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">间距</h3>
                      <div className="space-y-2">
                        {Object.entries(config.spacing).map(([key, val]) => (
                          val && key !== 'source' ? (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">{key}</span>
                              <span className="text-gray-900 font-mono">{val}</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Shadows */}
            {config.shadows.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">阴影</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.shadows.map((shadow, i) => (
                    <div key={i} className="bg-white rounded-lg border p-4">
                      <p className="text-sm font-medium text-gray-900">{shadow.label}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{shadow.value}</p>
                      {shadow.description && (
                        <p className="text-xs text-gray-400 mt-1">{shadow.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Borders */}
            {config.borders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">边框</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.borders.map((border, i) => (
                    <div key={i} className="bg-white rounded-lg border p-4">
                      <p className="text-sm font-medium text-gray-900">{border.label}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{border.value}</p>
                      {border.description && (
                        <p className="text-xs text-gray-400 mt-1">{border.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Panels */}
            {config.panels.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">设计面板</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.panels.map((panel, i) => (
                    <div key={i} className="bg-white rounded-lg border p-5">
                      <p className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-2">
                        {panel.eyebrow}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{panel.title}</h3>
                      <p className="text-sm text-gray-600">{panel.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Usage Guidance */}
            {config.usageGuidance && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">使用建议</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <h3 className="text-sm font-medium text-green-800 mb-2">建议</h3>
                    <ul className="space-y-1.5">
                      {config.usageGuidance.do.map((item, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="mt-0.5">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">避免</h3>
                    <ul className="space-y-1.5">
                      {config.usageGuidance.dont.map((item, i) => (
                        <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                          <span className="mt-0.5">✗</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignMdBatchShowcase;
