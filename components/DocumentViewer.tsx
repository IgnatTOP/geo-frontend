import { useState, useEffect } from 'react'
import { Button } from './ui/button'

interface DocumentViewerProps {
  url: string
  filename?: string
  className?: string
}

/**
 * Компонент для встраивания и просмотра документов
 * Поддерживает: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), TXT
 */
export default function DocumentViewer({ url, filename, className = '' }: DocumentViewerProps) {
  // Все хуки должны быть на верхнем уровне
  const [viewMode, setViewMode] = useState<'embed' | 'download'>('embed')
  const [content, setContent] = useState<string>('')
  const [txtLoading, setTxtLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false) // Предпросмотр по умолчанию закрыт
  
  // Определяем тип документа по расширению
  const getFileExtension = (url: string): string => {
    const match = url.match(/\.([^./?#]+)(?:[?#]|$)/i)
    return match ? match[1].toLowerCase() : ''
  }

  const extension = getFileExtension(url)
  const fileName = filename || url.split('/').pop() || 'документ'

  // Загрузка TXT файлов
  useEffect(() => {
    if (extension === 'txt') {
      fetch(url)
        .then(res => res.text())
        .then(text => {
          setContent(text)
          setTxtLoading(false)
        })
        .catch(err => {
          setContent('Ошибка загрузки файла')
          setTxtLoading(false)
        })
    }
  }, [url, extension])

  // PDF - встраиваем напрямую
  if (extension === 'pdf') {
    return (
      <div className={`card-modern overflow-hidden ${className}`}>
        <div className="p-4 bg-gradient-to-r from-red-500/10 to-transparent border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6M10 13h4M10 17h4M10 9h1"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{fileName}</h3>
                <p className="text-xs text-muted-foreground">PDF документ</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <svg className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isExpanded ? 'Свернуть' : 'Просмотр'}
              </Button>
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Скачать
                </Button>
              </a>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="h-[600px]">
            <iframe
              src={url}
              className="w-full h-full"
              title={fileName}
            />
          </div>
        )}
      </div>
    )
  }

  // TXT - отображаем содержимое
  if (extension === 'txt') {
    return (
      <div className={`card-modern overflow-hidden ${className}`}>
        <div className="p-4 bg-gradient-to-r from-gray-500/10 to-transparent border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{fileName}</h3>
                <p className="text-xs text-muted-foreground">Текстовый файл</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <svg className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isExpanded ? 'Свернуть' : 'Просмотр'}
              </Button>
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Скачать
                </Button>
              </a>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {txtLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-sm text-muted-foreground">Загрузка...</p>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-lg">{content}</pre>
            )}
          </div>
        )}
      </div>
    )
  }

  // Word (.doc, .docx) и PowerPoint (.ppt, .pptx) - через Google Docs Viewer
  if (['doc', 'docx', 'ppt', 'pptx'].includes(extension)) {
    const docType = ['doc', 'docx'].includes(extension) ? 'Word' : 'PowerPoint'
    const isWord = ['doc', 'docx'].includes(extension)
    const bgGradient = isWord ? 'from-blue-500/10' : 'from-orange-500/10'
    const bgIcon = isWord ? 'bg-blue-500/20' : 'bg-orange-500/20'
    const textIcon = isWord ? 'text-blue-600' : 'text-orange-600'
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`

    return (
      <div className={`card-modern overflow-hidden ${className}`}>
        <div className={`p-4 bg-gradient-to-r ${bgGradient} to-transparent border-b border-border/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-lg ${bgIcon} flex items-center justify-center flex-shrink-0`}>
                {isWord ? (
                  <svg className={`w-6 h-6 ${textIcon}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6M10 13h4M10 17h4M10 9h1"/>
                  </svg>
                ) : (
                  <svg className={`w-6 h-6 ${textIcon}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{fileName}</h3>
                <p className="text-xs text-muted-foreground">{docType} документ</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsExpanded(!isExpanded)
                  if (!isExpanded) {
                    setViewMode('embed')
                  }
                }}
              >
                <svg className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isExpanded ? 'Свернуть' : 'Просмотр'}
              </Button>
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Скачать
                </Button>
              </a>
            </div>
          </div>
        </div>
        {isExpanded && viewMode === 'embed' && (
          <div className="h-[600px]">
            <iframe
              src={googleViewerUrl}
              className="w-full h-full"
              title={fileName}
              onError={() => setViewMode('download')}
            />
          </div>
        )}
        {isExpanded && viewMode === 'download' && (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Документ готов к загрузке</h3>
            <p className="text-sm text-muted-foreground mb-4">Нажмите кнопку &quot;Скачать&quot; для загрузки файла</p>
          </div>
        )}
      </div>
    )
  }

  // Для остальных типов файлов - кнопка скачивания
  return (
    <div className={`card-modern p-6 ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-semibold mb-2">{fileName}</h3>
        <p className="text-sm text-muted-foreground mb-4">Файл .{extension}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" download>
          <Button className="btn-professional">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Скачать файл
          </Button>
        </a>
      </div>
    </div>
  )
}

