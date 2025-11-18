import api from './api'

export interface UploadResponse {
  url: string
  type: string
}

// Базовый URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * Загружает файл на сервер
 * @param file - Файл для загрузки
 * @param type - Тип файла: image, document, video, practice, report
 * @returns URL загруженного файла
 */
export async function uploadFile(file: File, type: string = 'other'): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const response = await api.post<UploadResponse>('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  // Если URL относительный, добавляем базовый URL
  let url = response.data.url
  if (url.startsWith('/')) {
    url = `${API_URL}${url}`
  }

  return {
    ...response.data,
    url,
  }
}

/**
 * Определяет тип файла по расширению
 */
export function getFileType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return 'image'
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return 'document'
    case 'mp4':
    case 'webm':
    case 'avi':
    case 'mov':
    case 'mkv':
      return 'video'
    default:
      return 'other'
  }
}

