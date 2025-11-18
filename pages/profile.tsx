import { useEffect, useState } from 'react'
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
  const { user, isAuth, logout } = useAuth()
  const [testGrades, setTestGrades] = useState<TestGrade[]>([])
  const [practiceGrades, setPracticeGrades] = useState<PracticeGrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuth) return

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
  }, [isAuth])

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
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Профиль</h1>
          <p className="text-muted-foreground text-lg">Ваши результаты и достижения</p>
        </div>

        {/* Информация о пользователе */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-glow">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.name}</CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span><strong>Роль:</strong> {user?.role === 'admin' ? 'Администратор' : 'Студент'}</span>
              </div>
            </div>
            <Button variant="destructive" className="w-full shadow-md" onClick={logout}>
              Выйти
            </Button>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Тесты</CardTitle>
              <CardDescription>
                Средняя оценка: {averageTestGrade.toFixed(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{testGrades.length}</p>
              <p className="text-sm text-muted-foreground">Оценок получено</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Практики</CardTitle>
              <CardDescription>
                Средняя оценка: {averagePracticeGrade.toFixed(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{practiceGrades.length}</p>
              <p className="text-sm text-muted-foreground">Оценок получено</p>
            </CardContent>
          </Card>
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

