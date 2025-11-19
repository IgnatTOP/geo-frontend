import { useState, useEffect } from 'react'
import { FullPageLoading } from '@/components/ui/loading'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { login } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

/**
 * Страница входа в систему
 */
export default function LoginPage() {
  const router = useRouter()
  const { login: setUser, isAuth, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Редирект, если уже авторизован
  useEffect(() => {
    if (!authLoading && isAuth) {
      router.push('/profile')
    }
  }, [isAuth, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Валидация на клиенте
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Введите корректный email адрес')
      return
    }

    if (password.length < 1) {
      setError('Введите пароль')
      return
    }

    setLoading(true)

    try {
      const response = await login({ email, password })
      await setUser(response.user)
      router.push('/profile')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Неверный email или пароль'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <FullPageLoading />
  }

  if (isAuth) {
    return null // Редирект в процессе
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="card-modern overflow-hidden shadow-professional-lg animate-scale-in">
          {/* Верхний декоративный элемент */}
          <div className="h-2 bg-gradient-to-r from-primary to-primary/70"></div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Добро пожаловать</h1>
              <p className="text-muted-foreground">Войдите в свой аккаунт для продолжения</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email адрес</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-professional"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-professional"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-professional py-6 text-base" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Вход в систему...
                  </span>
                ) : (
                  'Войти в систему'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Ещё нет аккаунта?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Создать аккаунт
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Дополнительная информация */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Нужна помощь? Свяжитесь с администратором
        </p>
      </div>
    </div>
  )
}

