import Link from 'next/link'

/**
 * Компонент футера сайта
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card/80 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О проекте */}
          <div>
            <h3 className="text-lg font-semibold mb-4">О проекте</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Профессиональная образовательная платформа для изучения географии 
              с интерактивными материалами, тестированием и практическими заданиями.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/theory" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Теория
                </Link>
              </li>
              <li>
                <Link href="/tests" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Тесты
                </Link>
              </li>
              <li>
                <Link href="/practices" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Практики
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Профиль
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@geography.edu" className="hover:text-primary transition-colors">
                  support@geography.edu
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+7 (XXX) XXX-XX-XX</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Россия, г. Москва</span>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Информация</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Условия использования
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Помощь
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Учебный портал по географии. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}

