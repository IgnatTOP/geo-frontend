import axios from 'axios'
import Cookies from 'js-cookie'

// Базовый URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ignattop-geo-backend-fb1b.twc1.net/api/v1'

// Глобальная функция для показа toast (устанавливается из ToastProvider)
let globalToastError: ((message: string) => void) | null = null

export const setGlobalToastError = (fn: (message: string) => void) => {
  globalToastError = fn
}

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена к каждому запросу
api.interceptors.request.use(
  (config: any) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Обрабатываем различные типы ошибок
    if (error.response?.status === 401) {
      // Токен невалиден или истек
      Cookies.remove('token')
      // Редирект на страницу входа
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      const errorMessage = error.response?.data?.error || 'Сессия истекла. Пожалуйста, войдите снова'
      if (globalToastError) {
        globalToastError(errorMessage)
      }
    } else if (error.response?.status === 403) {
      // Недостаточно прав доступа
      const errorMessage = error.response?.data?.error || 'Недостаточно прав для выполнения операции'
      if (globalToastError) {
        globalToastError(errorMessage)
      }
    } else if (error.response?.status === 404) {
      // Ресурс не найден
      const errorMessage = error.response?.data?.error || 'Запрошенный ресурс не найден'
      if (globalToastError) {
        globalToastError(errorMessage)
      }
    } else if (error.response?.status >= 500) {
      // Ошибка сервера
      const errorMessage = error.response?.data?.error || 'Ошибка сервера. Попробуйте позже'
      if (globalToastError) {
        globalToastError(errorMessage)
      }
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      // Проблемы с сетью
      const errorMessage = 'Ошибка сети. Проверьте подключение к интернету'
      if (globalToastError) {
        globalToastError(errorMessage)
      }
    } else if (error.response?.data?.error) {
      // Другие ошибки с сообщением от сервера
      if (globalToastError) {
        globalToastError(error.response.data.error)
      }
    }
    return Promise.reject(error)
  }
)

export default api

