import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Download, ExternalLink } from 'lucide-react'

interface DocumentViewerProps {
  url: string
  title?: string
  onClose?: () => void
}

/**
 * Компонент для просмотра документов на сайте
 */
export default function DocumentViewer({ url, title = 'Документ', onClose }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(true)

  const getDocumentViewerUrl = (docUrl: string): string => {
    const lowerUrl = docUrl.toLowerCase()
    
    // PDF - используем встроенный просмотрщик
    if (lowerUrl.endsWith('.pdf')) {
      return docUrl
    }
    
    // Word документы - используем Google Docs Viewer
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(docUrl)}&embedded=true`
    }
    
    // Текстовые файлы - загружаем и отображаем содержимое
    if (lowerUrl.endsWith('.txt') || lowerUrl.endsWith('.rtf')) {
      return docUrl
    }
    
    return docUrl
  }

  const getFileType = (docUrl: string): string => {
    const lowerUrl = docUrl.toLowerCase()
    if (lowerUrl.endsWith('.pdf')) return 'pdf'
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'word'
    if (lowerUrl.endsWith('.txt')) return 'text'
    if (lowerUrl.endsWith('.rtf')) return 'rtf'
    return 'unknown'
  }

  const fileType = getFileType(url)
  const viewerUrl = getDocumentViewerUrl(url)

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] w-full p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <DialogTitle className="text-base sm:text-lg break-words">{title}</DialogTitle>
            <div className="flex gap-2 flex-wrap">
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
              </a>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Открыть в новой вкладке
                </Button>
              </a>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {fileType === 'pdf' ? (
            <iframe
              src={viewerUrl}
              className="w-full h-[calc(90vh-120px)] border-0"
              title={title}
            />
          ) : fileType === 'word' ? (
            <iframe
              src={viewerUrl}
              className="w-full h-[calc(90vh-120px)] border-0"
              title={title}
            />
          ) : fileType === 'text' || fileType === 'rtf' ? (
            <div className="p-6 h-[calc(90vh-120px)] overflow-auto">
              <iframe
                src={viewerUrl}
                className="w-full h-full border-0"
                title={title}
              />
            </div>
          ) : (
            <div className="p-6 h-[calc(90vh-120px)] overflow-auto text-center">
              <p className="text-muted-foreground mb-4">
                Просмотр этого типа файла не поддерживается
              </p>
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Скачать файл
                </Button>
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

