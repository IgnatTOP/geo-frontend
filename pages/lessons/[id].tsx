import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { getLesson } from '@/services/lessons'
import type { Lesson } from '@/services/lessons'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoading } from '@/components/ui/loading'
import DocumentViewer from '@/components/DocumentViewer'
import Link from 'next/link'

/**
 * Компонент для компактного отображения видео с возможностью разворачивания
 */
function VideoItem({ 
  index, 
  title, 
  platform, 
  platformColor, 
  embedUrl, 
  videoUrl,
  isDirectVideo = false 
}: { 
  index: number
  title: string
  platform: string
  platformColor: string
  embedUrl: string | null
  videoUrl: string
  isDirectVideo?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getColorClasses = () => {
    switch (platformColor) {
      case 'red':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-600',
          badgeBg: 'bg-red-500/10',
          badgeText: 'text-red-600',
          badgeBorder: 'border-red-500/20'
        }
      case 'blue':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-600',
          badgeBg: 'bg-blue-500/10',
          badgeText: 'text-blue-600',
          badgeBorder: 'border-blue-500/20'
        }
      case 'green':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-600',
          badgeBg: 'bg-green-500/10',
          badgeText: 'text-green-600',
          badgeBorder: 'border-green-500/20'
        }
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-600',
          badgeBg: 'bg-gray-500/10',
          badgeText: 'text-gray-600',
          badgeBorder: 'border-gray-500/20'
        }
    }
  }

  const colors = getColorClasses()

  const getPlatformIcon = () => {
    if (platform === 'YouTube') {
      return (
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    } else if (platform === 'Vimeo') {
      return (
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
        </svg>
      )
    } else if (platform === 'Rutube') {
      return (
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className="card-modern overflow-hidden animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="p-4 bg-gradient-to-r from-muted/30 to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={`badge-professional ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder} text-xs px-2 py-0.5`}>
                  {getPlatformIcon()}
                  {platform}
                </span>
              </p>
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
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Открыть
              </Button>
            </a>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="relative">
          {isDirectVideo ? (
            <video
              src={videoUrl}
              controls
              className="w-full"
              preload="metadata"
              controlsList="nodownload"
              onError={(e) => {
                console.error('Ошибка загрузки видео:', videoUrl)
                const target = e.target as HTMLVideoElement
                target.parentElement!.innerHTML = `<div class="p-8 text-center text-muted-foreground">
                  <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="font-semibold mb-2">Не удалось загрузить видео</p>
                  <p class="text-sm">Проверьте URL: ${videoUrl}</p>
                </div>`
              }}
            >
              Ваш браузер не поддерживает видео.
            </video>
          ) : embedUrl ? (
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow={platform === 'YouTube' 
                  ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  : platform === 'Vimeo'
                  ? "autoplay; fullscreen; picture-in-picture"
                  : "clipboard-write; autoplay"}
                title={title}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

/**
 * Страница детального просмотра урока со всеми материалами
 */
export default function LessonDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuth, loading: authLoading } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ждем завершения загрузки авторизации и получения id из роутера
    if (authLoading || !id) return

    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadLesson = async () => {
      try {
        const data = await getLesson(Number(id))
        setLesson(data)
      } catch (error) {
        console.error('Ошибка загрузки урока:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [isAuth, id, authLoading])

  if (authLoading || loading) {
    return <FullPageLoading />
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Необходима авторизация</p>
            <Link href="/login">
              <Button className="w-full">Войти</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }


  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Урок не найден</p>
            <Link href="/theory">
              <Button className="w-full">Вернуться к урокам</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок урока */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/theory">
              <Button variant="outline" className="hover:bg-primary/10">
                ← Назад к урокам
              </Button>
            </Link>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-lg border-2 border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-glow">
                {lesson.number}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 text-gradient">
                  {lesson.topic}
                </h1>
                <p className="text-muted-foreground">Урок {lesson.number}</p>
              </div>
            </div>
            {lesson.content && (
              <div className="prose max-w-none mt-6">
                <div className="text-lg text-foreground/90 leading-relaxed whitespace-pre-line text-wrap text-scrollable">
                  {lesson.content}
                </div>
              </div>
            )}

            {/* Фотографии */}
            {lesson.images && (() => {
              try {
                const images = JSON.parse(lesson.images) as string[]
                if (images && images.length > 0) {
                  return (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-4">Фотографии</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((imageUrl, index) => {
                          const normalizedUrl = normalizeFileUrl(imageUrl) || imageUrl
                          return (
                          <div key={index} className="rounded-lg overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all relative h-64">
                            <Image
                              src={normalizedUrl}
                              alt={`Фото ${index + 1}`}
                              fill
                              className="object-cover cursor-pointer hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              onClick={() => window.open(normalizedUrl, '_blank')}
                            />
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
              } catch (e) {
                return null
              }
              return null
            })()}

            {/* Документы */}
            {lesson.documents && (() => {
              try {
                const documents = JSON.parse(lesson.documents) as string[]
                if (documents && documents.length > 0) {
                  return (
                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold">Документы к уроку</h3>
                      </div>
                      <div className="space-y-3">
                        {documents.map((docUrl, index) => {
                          const normalizedUrl = normalizeFileUrl(docUrl) || docUrl
                          const fileName = docUrl.split('/').pop() || `Документ ${index + 1}`
                          return (
                            <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                              <DocumentViewer url={normalizedUrl} filename={fileName} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
              } catch (e) {
                return null
              }
              return null
            })()}

            {/* Видеофайлы */}
            {lesson.video_files && (() => {
              try {
                const videoFiles = JSON.parse(lesson.video_files) as string[]
                if (videoFiles && videoFiles.length > 0) {
                  return (
                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold">Видеоматериалы к уроку</h3>
                      </div>
                      <div className="space-y-3">
                        {videoFiles.map((videoUrl, index) => {
                          const normalizedUrl = normalizeFileUrl(videoUrl) || videoUrl
                          
                          // Определяем тип видео по URL
                          const isYouTube = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i.test(normalizedUrl)
                          const isVimeo = /vimeo\.com\/(\d+)/i.test(normalizedUrl)
                          const isRutube = /rutube\.ru\/video\/([a-zA-Z0-9]+)/i.test(normalizedUrl)
                          
                          // YouTube видео
                          if (isYouTube) {
                            const embedUrl = normalizedUrl
                              .replace('watch?v=', 'embed/')
                              .replace('youtu.be/', 'youtube.com/embed/')
                            
                            return (
                              <VideoItem 
                                key={index} 
                                index={index}
                                title={`Видео ${index + 1}`}
                                platform="YouTube"
                                platformColor="red"
                                embedUrl={embedUrl}
                                videoUrl={normalizedUrl}
                              />
                            )
                          }
                          
                          // Vimeo видео
                          if (isVimeo) {
                            const vimeoMatch = normalizedUrl.match(/vimeo\.com\/(\d+)/i)
                            const vimeoId = vimeoMatch ? vimeoMatch[1] : ''
                            const embedUrl = `https://player.vimeo.com/video/${vimeoId}`
                            
                            return (
                              <VideoItem 
                                key={index} 
                                index={index}
                                title={`Видео ${index + 1}`}
                                platform="Vimeo"
                                platformColor="blue"
                                embedUrl={embedUrl}
                                videoUrl={normalizedUrl}
                              />
                            )
                          }
                          
                          // Rutube видео
                          if (isRutube) {
                            const rutubeMatch = normalizedUrl.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/i)
                            const rutubeId = rutubeMatch ? rutubeMatch[1] : ''
                            const embedUrl = `https://rutube.ru/play/embed/${rutubeId}`
                            
                            return (
                              <VideoItem 
                                key={index} 
                                index={index}
                                title={`Видео ${index + 1}`}
                                platform="Rutube"
                                platformColor="green"
                                embedUrl={embedUrl}
                                videoUrl={normalizedUrl}
                              />
                            )
                          }
                          
                          // Прямая ссылка на видеофайл
                          return (
                            <VideoItem 
                              key={index} 
                              index={index}
                              title={`Видео ${index + 1}`}
                              platform="Видеофайл"
                              platformColor="gray"
                              embedUrl={null}
                              videoUrl={normalizedUrl}
                              isDirectVideo={true}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                }
              } catch (e) {
                return null
              }
              return null
            })()}
          </div>
        </div>

        {/* Тесты */}
        {lesson.tests && lesson.tests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              Тесты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.tests.map((test: any) => (
                <Card key={test.id} className="card-hover border-2 border-primary/10 hover:border-primary/40">
                  <CardHeader>
                    <CardTitle className="text-xl">{test.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/tests/${test.id}/take`}>
                      <Button className="w-full gradient-primary shadow-glow">
                        Пройти тест
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Практические задания */}
        {lesson.practices && lesson.practices.length > 0 && (
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              Практические задания
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.practices.map((practice: any) => (
                <Card key={practice.id} className="card-hover border-2 border-primary/10 hover:border-primary/40">
                  <CardHeader>
                    <CardTitle className="text-xl">{practice.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    {practice.file_url && (() => {
                      const normalizedUrl = normalizeFileUrl(practice.file_url) || practice.file_url
                      return (
                      <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                        <Button variant="outline" className="flex-1 hover:bg-primary/10">
                          Скачать
                        </Button>
                      </a>
                      )
                    })()}
                    <Button
                      className="flex-1 gradient-primary shadow-glow"
                      onClick={() => router.push(`/practices/${practice.id}`)}
                    >
                      Открыть
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Видеоматериалы */}
        {lesson.videos && lesson.videos.length > 0 && (
          <section className="mb-10 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Видеоматериалы</h2>
                <p className="text-sm text-muted-foreground">Дополнительные обучающие видео</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lesson.videos.map((video: any, index: number) => (
                <div key={video.id} className="card-modern group overflow-hidden animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  {video.type === 'youtube' && (
                    <>
                      <div className="relative">
                        <div className="absolute top-3 left-3 z-10">
                          <div className="badge-professional bg-red-500 text-white border-0">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            YouTube
                          </div>
                        </div>
                        <div className="aspect-video">
                          <iframe
                            src={video.url.replace('watch?v=', 'embed/')}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={video.title}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">Встроенное видео</p>
                      </div>
                    </>
                  )}
                  {video.type === 'vimeo' && (
                    <>
                      <div className="relative">
                        <div className="absolute top-3 left-3 z-10">
                          <div className="badge-professional bg-blue-500 text-white border-0">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
                            </svg>
                            Vimeo
                          </div>
                        </div>
                        <div className="aspect-video">
                          <iframe
                            src={video.url}
                            className="w-full h-full"
                            allowFullScreen
                            allow="autoplay; fullscreen; picture-in-picture"
                            title={video.title}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">Встроенное видео</p>
                      </div>
                    </>
                  )}
                  {video.type === 'rutube' && (
                    <>
                      <div className="relative">
                        <div className="absolute top-3 left-3 z-10">
                          <div className="badge-professional bg-green-600 text-white border-0">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                            Rutube
                          </div>
                        </div>
                        <div className="aspect-video">
                          <iframe
                            src={video.url.replace('/video/', '/play/embed/')}
                            className="w-full h-full"
                            allowFullScreen
                            allow="clipboard-write; autoplay"
                            title={video.title}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">Встроенное видео</p>
                      </div>
                    </>
                  )}
                  {video.type === 'direct' && (
                    <>
                      <div className="p-4 pb-0">
                        <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Прямая ссылка на видео</p>
                      </div>
                      <div className="p-4 pt-0">
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full btn-professional">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Открыть видео
                          </Button>
                        </a>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Если нет материалов */}
        {(!lesson.tests || lesson.tests.length === 0) &&
          (!lesson.practices || lesson.practices.length === 0) &&
          (!lesson.videos || lesson.videos.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  К этому уроку пока не добавлены материалы
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  )
}


