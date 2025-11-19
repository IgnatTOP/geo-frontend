import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { getLessons } from '@/services/lessons'
import { getVideos } from '@/services/videos'
import { getFacts } from '@/services/facts'
import type { Lesson } from '@/services/lessons'
import type { Video } from '@/services/videos'
import type { Fact } from '@/services/facts'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoading } from '@/components/ui/loading'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

/**
 * Страница теории: уроки, видео, факты
 */
export default function TheoryPage() {
  const { isAuth, loading: authLoading } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [facts, setFacts] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTopic, setFilterTopic] = useState<string>('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [lessonsData, videosData, factsResponse] = await Promise.all([
          getLessons(),
          getVideos(),
          getFacts(1, 12), // Получаем первые 12 фактов для страницы теории
        ])
        setLessons(lessonsData)
        setVideos(videosData)
        setFacts(factsResponse.facts) // Извлекаем массив фактов из ответа
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuth, authLoading])

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

  // Фильтрация и поиск
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = !searchQuery || 
      lesson.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !filterTopic || lesson.topic.toLowerCase().includes(filterTopic.toLowerCase())
    return matchesSearch && matchesFilter
  })

  // Получаем уникальные темы для фильтра
  const topics = Array.from(new Set(lessons.map(l => l.topic.split(':')[0].trim() || l.topic.split(' ')[0])))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        {/* Hero секция */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="section-title text-4xl md:text-5xl mb-1">
                Теоретические материалы
              </h1>
              <p className="text-muted-foreground text-lg">Структурированные уроки, видео и познавательные факты</p>
            </div>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="mb-10 space-y-6 animate-slide-in">
          <div className="card-modern p-6">
            <SearchBar 
              placeholder="Поиск по урокам, темам и содержанию..." 
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
          
          {topics.length > 0 && (
            <div className="card-modern p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Фильтр по теме
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterTopic === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTopic('')}
                  className="rounded-full"
                >
                  Все темы
                </Button>
                {topics.slice(0, 10).map(topic => (
                  <Button
                    key={topic}
                    variant={filterTopic === topic ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTopic(topic)}
                    className="rounded-full"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Уроки */}
        <section className="mb-16 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Уроки</h2>
                {filteredLessons.length !== lessons.length && (
                  <p className="text-sm text-muted-foreground">Показано {filteredLessons.length} из {lessons.length}</p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, index) => {
              const materialsCount = 
                (lesson.tests?.length || 0) +
                (lesson.practices?.length || 0) +
                (lesson.videos?.length || 0)
              
              return (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <div 
                    className="card-modern group cursor-pointer overflow-hidden animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Обложка урока */}
                    {(() => {
                      try {
                        const images = lesson.images ? JSON.parse(lesson.images) as string[] : []
                        if (images && images.length > 0) {
                          return (
                            <div className="relative h-52 overflow-hidden">
                              <Image
                                src={normalizeFileUrl(images[0]) || images[0]}
                                alt={lesson.topic}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />
                              <div className="absolute top-4 left-4">
                                <div className="badge-professional bg-white/95 text-primary border-0 backdrop-blur-sm">
                                  Урок {lesson.number}
                                </div>
                              </div>
                            </div>
                          )
                        }
                      } catch (e) {
                        // Игнорируем ошибки парсинга
                      }
                      return (
                        <div className="relative h-52 bg-gradient-to-br from-primary/15 via-primary/8 to-primary/5 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                            {lesson.number}
                          </div>
                        </div>
                      )
                    })()}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        {!(() => {
                          try {
                            const images = lesson.images ? JSON.parse(lesson.images) as string[] : []
                            return images && images.length > 0
                          } catch {
                            return false
                          }
                        })() && (
                          <div className="badge-professional">
                            Урок {lesson.number}
                          </div>
                        )}
                        {materialsCount > 0 && (
                          <div className="badge-professional bg-primary/5 text-primary border-primary/20">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {materialsCount}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.topic}
                      </h3>
                      <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed text-sm">
                        {lesson.content?.substring(0, 150) || 'Изучите материалы урока...'}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {(lesson.tests?.length || 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{lesson.tests?.length || 0}</span>
                            </div>
                          )}
                          {(lesson.practices?.length || 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>{lesson.practices?.length || 0}</span>
                            </div>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          {filteredLessons.length === 0 && (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-12 text-center">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-muted-foreground text-lg">Уроки не найдены</p>
                <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска или фильтра</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Видео - группируем по урокам */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1 h-8 rounded-full gradient-primary"></span>
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Видеоматериалы
          </h2>
          {lessons.map((lesson) => {
            const lessonVideos = videos.filter((v) => v.lesson_id === lesson.id)
            if (lessonVideos.length === 0) return null
            
            return (
              <div key={lesson.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Урок {lesson.number}: {lesson.topic}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessonVideos.map((video) => (
                    <Card key={video.id} className="card-hover border-2 border-primary/10 hover:border-primary/40 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {video.type === 'youtube' && (
                          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                            <iframe
                              src={video.url.replace('watch?v=', 'embed/')}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}
                        {video.type !== 'youtube' && (
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full hover:bg-primary/10">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Открыть видео
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
          {videos.filter((v) => !v.lesson_id).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Без урока</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.filter((v) => !v.lesson_id).map((video) => (
                  <Card key={video.id}>
                    <CardHeader>
                      <CardTitle>{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {video.type === 'youtube' && (
                        <div className="aspect-video">
                          <iframe
                            src={video.url.replace('watch?v=', 'embed/')}
                            className="w-full h-full rounded-md"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      )}
                      {video.type === 'vimeo' && (
                        <div className="aspect-video">
                          <iframe
                            src={video.url}
                            className="w-full h-full rounded-md"
                            allowFullScreen
                            allow="autoplay; fullscreen; picture-in-picture"
                          />
                        </div>
                      )}
                      {video.type === 'rutube' && (
                        <div className="aspect-video">
                          <iframe
                            src={video.url.replace('/video/', '/play/embed/')}
                            className="w-full h-full rounded-md"
                            allowFullScreen
                            allow="clipboard-write; autoplay"
                          />
                        </div>
                      )}
                      {video.type === 'direct' && (
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full">
                            Открыть видео
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Факты */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Интересные факты
            </h2>
            <Link href="/facts">
              <Button variant="outline" className="hover:bg-primary/10">
                Все факты →
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {facts.map((fact) => (
              <Card key={fact.id}>
                {fact.image_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={normalizeFileUrl(fact.image_url) || fact.image_url}
                      alt={fact.title}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{fact.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-wrap">{fact.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

