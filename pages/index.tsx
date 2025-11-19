import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FullPageLoading } from '@/components/ui/loading'
import { getFacts } from '@/services/facts'
import type { Fact } from '@/services/facts'
import { normalizeImageUrl } from '@/services/upload'
import Link from 'next/link'

/**
 * Главная страница с навигацией и приветствием
 */
export default function Home() {
  const { user, isAuth, loading } = useAuth()
  const router = useRouter()
  const [facts, setFacts] = useState<Fact[]>([])

  useEffect(() => {
    // Загружаем последние факты
    const loadFacts = async () => {
      try {
        const data = await getFacts(1, 3) // Получаем первые 3 факта
        setFacts(data.facts) // Извлекаем массив фактов из ответа
      } catch (error) {
        console.error('Ошибка загрузки фактов:', error)
      }
    }
    loadFacts()
  }, [])

  if (loading) {
    return <FullPageLoading />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero секция */}
      <section className="section-professional pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-scale-in">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-primary">Образовательная платформа</span>
            </div>
            
            <h1 className="section-title text-5xl md:text-6xl mb-6">
              Добро пожаловать в мир географии
            </h1>
            <p className="section-subtitle mx-auto mb-8">
              Профессиональный учебный портал с интерактивными материалами, тестированием знаний и практическими заданиями. Изучайте географию удобно и эффективно.
            </p>
            
            {!isAuth && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register">
                  <Button className="btn-gradient px-8 py-6 text-lg">
                    Начать обучение
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="px-8 py-6 text-lg border-2">
                    Войти в систему
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        {/* Основные разделы */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="card-modern group animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Теоретические материалы</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Структурированные уроки, видеоматериалы и познавательные факты о географии
              </p>
              <Link href="/theory">
                <Button className="btn-professional w-full">
                  Изучать теорию
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>

          <div className="card-modern group animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Тестирование знаний</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Проверьте усвоение материала с помощью интерактивных тестов
              </p>
              <Link href="/tests">
                <Button className="btn-professional w-full">
                  Пройти тесты
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>

          <div className="card-modern group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Практические работы</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Закрепите знания на практике, выполняя задания и получая обратную связь
              </p>
              <Link href="/practices">
                <Button className="btn-professional w-full">
                  Выполнить задания
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Интересные факты */}
        {facts.length > 0 && (
          <section className="section-professional">
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-bold mb-2">
                    <span className="text-gradient">Интересные факты</span>
                  </h2>
                  <p className="text-muted-foreground">Расширьте свой кругозор познавательными фактами о географии</p>
                </div>
                <Link href="/facts">
                  <Button variant="outline" className="mt-4 sm:mt-0 border-2 hover:border-primary/40 hover:bg-primary/5">
                    Все факты
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {facts.map((fact, index) => (
                  <Link key={fact.id} href={`/facts/${fact.id}`}>
                    <div 
                      className="card-modern group cursor-pointer overflow-hidden animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {fact.image_url && (
                        <div className="relative overflow-hidden h-56">
                          <Image
                            src={normalizeImageUrl(fact.image_url) || fact.image_url}
                            alt={fact.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
                          <div className="absolute top-4 right-4">
                            <div className="badge-professional bg-white/90 text-primary border-0 backdrop-blur-sm">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Факт
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{fact.title}</h3>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed text-wrap">{fact.content}</p>
                        <div className="mt-4 flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                          <span>Читать далее</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

