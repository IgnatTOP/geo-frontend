import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { uploadFile, getFileType } from '@/services/upload'
import { Loader2, Upload, X } from 'lucide-react'

interface FileUploadProps {
  onUpload: (url: string) => void
  accept?: string
  type?: string
  label?: string
  className?: string
}

/**
 * Компонент для загрузки файлов
 */
export default function FileUpload({ 
  onUpload, 
  accept, 
  type = 'other',
  label = 'Загрузить файл',
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // Определяем тип файла автоматически, если не указан
      const fileType = type === 'other' ? getFileType(file.name) : type
      const response = await uploadFile(file, fileType)
      onUpload(response.url)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки файла')
      console.error('Ошибка загрузки файла:', err)
    } finally {
      setUploading(false)
      // Сбрасываем input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={`file-upload-${Math.random()}`}
        disabled={uploading}
      />
      <label htmlFor={`file-upload-${Math.random()}`}>
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

interface FileListProps {
  files: string[]
  onRemove: (index: number) => void
  label?: string
}

/**
 * Компонент для отображения списка загруженных файлов
 */
export function FileList({ files, onRemove, label = 'Файлы' }: FileListProps) {
  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2">
        {files.map((url, index) => (
          <div key={index} className="flex items-center justify-between rounded-md border p-2">
            <span className="text-sm truncate flex-1">{url}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="ml-2 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

