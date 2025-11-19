import { useEffect, useState } from 'react'
import { FullPageLoading } from '@/components/ui/loading'
import { useAuth } from '@/context/AuthContext'
import { getMyTestGrades } from '@/services/tests'
import { getMyPracticeGrades } from '@/services/practices'
import type { TestGrade } from '@/services/tests'
import type { PracticeGrade } from '@/services/practices'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Страница профиля пользователя с результатами
 */
export default function ProfilePage() {
  const { user, isAuth, logout, loading: authLoading } = useAuth()
  const [testGrades, setTestGrades] = useState<TestGrade[]>([])
  const [practiceGrades, setPracticeGrades] = useState<PracticeGrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [testsData, practicesData] = await Promise.all([
          getMyTestGrades(),
          getMyPracticeGrades(),
        ])
        setTestGrades(testsData)
        setPracticeGrades(practicesData)
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

  if (loading) {
    return <FullPageLoading />
  }

  const averageTestGrade =
    testGrades.length > 0
      ? testGrades.reduce((sum, g) => sum + g.grade, 0) / testGrades.length
      : 0

  const averagePracticeGrade =
    practiceGrades.length > 0
      ? practiceGrades.reduce((sum, g) => sum + g.grade, 0) / practiceGrades.length
      : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        {/* Hero секция */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="section-title text-4xl md:text-5xl mb-1">
                Личный кабинет
              </h1>
              <p className="text-muted-foreground text-lg">Ваши результаты и прогресс обучения</p>
            </div>
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="card-modern mb-8 overflow-hidden animate-scale-in">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border/50">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
                <p className="text-muted-foreground text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="badge-professional">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {user?.role === 'admin' ? 'Администратор' : 'Студент'}
                </div>
              </div>
              <Button variant="destructive" size="lg" onClick={logout}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Выйти
              </Button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card-modern animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Тесты</p>
                  <p className="text-4xl font-bold">{testGrades.length}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-primary">{averageTestGrade.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">средняя оценка</p>
              </div>
              <div className="mt-4 progress-professional">
                <div className="progress-professional-bar" style={{ width: `${(averageTestGrade / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="card-modern animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Практики</p>
                  <p className="text-4xl font-bold">{practiceGrades.length}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-primary">{averagePracticeGrade.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">средняя оценка</p>
              </div>
              <div className="mt-4 progress-professional">
                <div className="progress-professional-bar" style={{ width: `${(averagePracticeGrade / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Оценки по тестам */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Оценки по тестам</CardTitle>
          </CardHeader>
          <CardContent>
            {testGrades.length > 0 ? (
              <div className="space-y-4">
                {testGrades.map((grade) => (
                  <div key={grade.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{grade.test?.title || 'Тест'}</p>
                        <p className="text-sm text-muted-foreground">
                          Оценка: {grade.grade}
                        </p>
                        {grade.comment && (
                          <p className="text-sm mt-2">{grade.comment}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(grade.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Оценок пока нет</p>
            )}
          </CardContent>
        </Card>

        {/* Оценки по практикам */}
        <Card>
          <CardHeader>
            <CardTitle>Оценки по практическим заданиям</CardTitle>
          </CardHeader>
          <CardContent>
            {practiceGrades.length > 0 ? (
              <div className="space-y-4">
                {practiceGrades.map((grade) => (
                  <div key={grade.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{grade.practice?.title || 'Практика'}</p>
                        <p className="text-sm text-muted-foreground">
                          Оценка: {grade.grade}
                        </p>
                        {grade.comment && (
                          <p className="text-sm mt-2">{grade.comment}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(grade.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Оценок пока нет</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

