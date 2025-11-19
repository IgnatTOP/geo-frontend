import { useEffect, useState, useMemo } from 'react'
import { FullPageLoading } from '@/components/ui/loading'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getTests, createTest, updateTest, deleteTest, getAllTestAttempts, createTestGrade, updateTestGrade, deleteTestGrade, deleteTestAttempt } from '@/services/tests'
import { getLessons } from '@/services/lessons'
import type { Test, TestAttempt, TestGrade } from '@/services/tests'
import type { Lesson } from '@/services/lessons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

/**
 * Страница управления тестами и оценками (админка)
 */
export default function AdminTestsPage() {
  const { user, isAuth } = useAuth()
  const { success, error: showError } = useToast()
  const [tests, setTests] = useState<Test[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tests' | 'attempts'>('tests')
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null)
  const [formData, setFormData] = useState({ 
    lesson_id: '', 
    title: '', 
    description: '',
    type: 'single' as 'single' | 'multiple',
    allow_retake: false,
    questions: [] as Array<{ question: string; options: string[]; correct_answer: number; order: number }>
  })
  const [gradeData, setGradeData] = useState({ user_id: '', test_id: '', attempt_id: '', grade: '', comment: '' })

  // Группировка тестов по урокам
  const testsByLesson = useMemo(() => {
    const grouped: Record<number, Test[]> = {}
    tests.forEach((test) => {
      if (!grouped[test.lesson_id]) {
        grouped[test.lesson_id] = []
      }
      grouped[test.lesson_id].push(test)
    })
    return grouped
  }, [tests])

  // Группировка попыток по урокам
  const attemptsByLesson = useMemo(() => {
    const grouped: Record<number, TestAttempt[]> = {}
    if (!attempts || !Array.isArray(attempts)) {
      return grouped
    }
    attempts.forEach((attempt: any) => {
      const lessonId = attempt.test?.lesson_id
      if (lessonId) {
        if (!grouped[lessonId]) {
          grouped[lessonId] = []
        }
        grouped[lessonId].push(attempt)
      }
    })
    return grouped
  }, [attempts])

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadLessons()
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, user, activeTab])

  const loadLessons = async () => {
    try {
      const data = await getLessons()
      setLessons(data)
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error)
    }
  }

  const loadData = async () => {
    try {
      if (activeTab === 'tests') {
        const data = await getTests()
        setTests(data || [])
      } else if (activeTab === 'attempts') {
        const data = await getAllTestAttempts()
        setAttempts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      // Устанавливаем пустые массивы в случае ошибки
      if (activeTab === 'tests') {
        setTests([])
      } else if (activeTab === 'attempts') {
        setAttempts([])
      }
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', ''], correct_answer: 0, order: formData.questions.length + 1 }]
    })
  }

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 }))
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions]
    if (field === 'options') {
      newQuestions[index].options = value
    } else if (field === 'addOption') {
      newQuestions[index].options = [...newQuestions[index].options, '']
    } else if (field === 'removeOption') {
      newQuestions[index].options = newQuestions[index].options.filter((_, i) => i !== value)
      if (newQuestions[index].correct_answer >= newQuestions[index].options.length) {
        newQuestions[index].correct_answer = 0
      }
    } else {
      (newQuestions[index] as any)[field] = value
    }
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleCreateTest = async () => {
    if (!formData.lesson_id) {
      showError('Выберите урок')
      return
    }
    if (!formData.title) {
      showError('Введите название теста')
      return
    }
    if (formData.questions.length === 0) {
      showError('Добавьте хотя бы один вопрос')
      return
    }
    // Валидация вопросов
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i]
      if (!q.question) {
        showError(`Вопрос ${i + 1}: введите текст вопроса`)
        return
      }
      if (q.options.length < 2) {
        showError(`Вопрос ${i + 1}: добавьте хотя бы 2 варианта ответа`)
        return
      }
      if (q.options.some(opt => !opt.trim())) {
        showError(`Вопрос ${i + 1}: все варианты ответов должны быть заполнены`)
        return
      }
      if (q.correct_answer < 0 || q.correct_answer >= q.options.length) {
        showError(`Вопрос ${i + 1}: выберите правильный ответ`)
        return
      }
    }
    try {
      await createTest({
        lesson_id: parseInt(formData.lesson_id),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        allow_retake: formData.allow_retake,
        questions: formData.questions,
      } as any)
      success(`Тест "${formData.title}" успешно создан`)
      setIsDialogOpen(false)
      setFormData({ lesson_id: '', title: '', description: '', type: 'single', allow_retake: false, questions: [] })
      loadData()
    } catch (error) {
      console.error('Ошибка создания теста:', error)
      showError('Не удалось создать тест')
    }
  }

  const handleDeleteTest = async (id: number) => {
    if (!confirm('Удалить тест?')) return
    try {
      await deleteTest(id)
      success('Тест успешно удален')
      loadData()
    } catch (error) {
      console.error('Ошибка удаления теста:', error)
      // Ошибка уже обработана в API интерцепторе
    }
  }

  const handleCreateGrade = async () => {
    if (!gradeData.grade || parseFloat(gradeData.grade) < 0) {
      showError('Введите корректную оценку')
      return
    }
    
    try {
      const gradeValue = parseFloat(gradeData.grade)
      await createTestGrade({
        user_id: parseInt(gradeData.user_id),
        test_id: parseInt(gradeData.test_id),
        attempt_id: gradeData.attempt_id ? parseInt(gradeData.attempt_id) : undefined,
        grade: gradeValue,
        comment: gradeData.comment || undefined,
      })
      
      const studentName = (selectedAttempt as any)?.user?.name || 'студенту'
      success(`Оценка ${gradeValue.toFixed(1)} успешно выставлена ${studentName}`)
      
      setIsGradeDialogOpen(false)
      setGradeData({ user_id: '', test_id: '', attempt_id: '', grade: '', comment: '' })
      setSelectedAttempt(null)
      loadData()
    } catch (error) {
      console.error('Ошибка создания оценки:', error)
      showError('Не удалось выставить оценку')
    }
  }

  const openGradeDialog = (attempt: TestAttempt) => {
    setSelectedAttempt(attempt)
    setGradeData({
      user_id: attempt.user_id.toString(),
      test_id: attempt.test_id.toString(),
      attempt_id: attempt.id.toString(),
      grade: '',
      comment: '',
    })
    setIsGradeDialogOpen(true)
  }

  const handleAllowRetake = async (attemptId: number, studentName: string) => {
    if (!confirm(`Разрешить пересдачу для ${studentName}?\n\nЭто удалит запись о прохождении теста и все оценки, связанные с этой попыткой.`)) {
      return
    }
    
    try {
      await deleteTestAttempt(attemptId)
      success(`Пересдача разрешена для ${studentName}. Попытка и оценки удалены.`)
      loadData()
    } catch (error) {
      console.error('Ошибка удаления попытки:', error)
      showError('Не удалось разрешить пересдачу')
    }
  }

  if (!isAuth || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-destructive mb-4">
              Доступ запрещен. Требуются права администратора.
            </p>
            <Link href="/">
              <Button className="w-full">На главную</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <FullPageLoading />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Управление тестами</h1>
          <Link href="/admin">
            <Button variant="outline">Назад</Button>
          </Link>
        </div>

        {/* Вкладки */}
        <div className="flex gap-4 mb-6 border-b pb-0">
          <button
            className={`pb-3 px-6 font-semibold transition-all ${
              activeTab === 'tests' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('tests')}
          >
            Тесты
          </button>
          <button
            className={`pb-3 px-6 font-semibold transition-all ${
              activeTab === 'attempts' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('attempts')}
          >
            Попытки студентов
          </button>
        </div>

        {/* Список тестов */}
        {activeTab === 'tests' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-muted-foreground">
                Всего тестов: <span className="font-semibold text-foreground">{tests.length}</span>
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                  setEditingTest(null)
                  setFormData({ lesson_id: '', title: '', description: '', type: 'single', allow_retake: false, questions: [] })
                  }}
                  className="shadow-md"
                >
                  + Создать тест
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                  <DialogHeader>
                    <DialogTitle>Создать тест</DialogTitle>
                    <DialogDescription>
                      Создайте тест с вопросами и вариантами ответов
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lesson_id">Урок *</Label>
                      <select
                        id="lesson_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.lesson_id}
                        onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                        required
                      >
                        <option value="">Выберите урок</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            Урок {lesson.number}: {lesson.topic}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="title">Название *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Название теста"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <textarea
                        id="description"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Описание теста (необязательно)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Тип теста</Label>
                      <select
                        id="type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'single' | 'multiple' })}
                      >
                        <option value="single">Один правильный ответ</option>
                        <option value="multiple">Несколько правильных ответов</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allow_retake"
                        checked={formData.allow_retake}
                        onChange={(e) => setFormData({ ...formData, allow_retake: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="allow_retake" className="cursor-pointer font-normal">
                        Разрешить пересдачу (студенты смогут проходить тест несколько раз)
                      </Label>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-lg font-semibold">Вопросы</Label>
                        <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                          + Добавить вопрос
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        {formData.questions.map((question, qIndex) => (
                          <div key={qIndex} className="border-2 border-primary/20 rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold">Вопрос {qIndex + 1}</h4>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeQuestion(qIndex)}
                              >
                                Удалить
                              </Button>
                            </div>
                            
                            <div>
                              <Label>Текст вопроса *</Label>
                              <Input
                                value={question.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                placeholder="Введите вопрос"
                              />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <Label>Варианты ответов *</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuestion(qIndex, 'addOption', null)}
                                >
                                  + Вариант
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex gap-2 items-center">
                                    <input
                                      type={formData.type === 'multiple' ? 'checkbox' : 'radio'}
                                      name={`correct-${qIndex}`}
                                      checked={question.correct_answer === oIndex}
                                      onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                      className="w-5 h-5"
                                    />
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options]
                                        newOptions[oIndex] = e.target.value
                                        updateQuestion(qIndex, 'options', newOptions)
                                      }}
                                      placeholder={`Вариант ${oIndex + 1}`}
                                      className="flex-1"
                                    />
                                    {question.options.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateQuestion(qIndex, 'removeOption', oIndex)}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {formData.questions.length === 0 && (
                          <p className="text-muted-foreground text-center py-8">
                            Нажмите &ldquo;Добавить вопрос&rdquo; чтобы создать первый вопрос
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleCreateTest}>Создать</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Группировка тестов по урокам */}
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Сначала создайте уроки</p>
                  <Link href="/admin/lessons">
                    <Button className="mt-4" variant="outline">Перейти к урокам</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const lessonTests = testsByLesson[lesson.id] || []
                  const isExpanded = selectedLesson === lesson.id
                  
                  return (
                    <Card key={lesson.id} className="overflow-hidden">
                      <div
                        className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLesson(isExpanded ? null : lesson.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">
                              Урок {lesson.number}: {lesson.topic}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Тестов: {lessonTests.length}
                            </p>
                          </div>
                          <div className="text-2xl text-muted-foreground">
                            {isExpanded ? '−' : '+'}
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t bg-muted/20 p-6">
                          {lessonTests.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              Тестов для этого урока пока нет
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {lessonTests.map((test) => (
                                <Card key={test.id} className="flex flex-col h-full">
                                  <CardHeader className="flex-1">
                                    <CardTitle className="text-lg line-clamp-2">
                                      {test.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 min-h-[60px]">
                      {test.description || 'Нет описания'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          test.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                          {test.type === 'single' ? 'Один ответ' : 'Несколько ответов'}
                                        </span>
                                        {test.allow_retake && (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            Пересдача
                                          </span>
                                        )}
                                      </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteTest(test.id)}
                      className="w-full"
                                        size="sm"
                    >
                      Удалить
                    </Button>
                                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
            
            {tests.length === 0 && lessons.length > 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Тесты пока не добавлены</p>
                  <Button onClick={() => setIsDialogOpen(true)}>Создать первый тест</Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Список попыток по урокам */}
        {activeTab === 'attempts' && (
          <div className="space-y-4">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Всего попыток: <span className="font-semibold text-foreground">{attempts?.length || 0}</span>
              </p>
            </div>

            {lessons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Уроки не найдены</p>
                </CardContent>
              </Card>
            ) : !attempts || attempts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Попыток пока нет. Студенты еще не проходили тесты.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const lessonAttempts = attemptsByLesson[lesson.id] || []
                  const isExpanded = selectedLesson === lesson.id
                  
                  if (lessonAttempts.length === 0) return null
                  
                  return (
                    <Card key={lesson.id} className="overflow-hidden">
                      <div
                        className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLesson(isExpanded ? null : lesson.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">
                              Урок {lesson.number}: {lesson.topic}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Попыток: {lessonAttempts.length}
                            </p>
                          </div>
                          <div className="text-2xl text-muted-foreground">
                            {isExpanded ? '−' : '+'}
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t bg-muted/20 p-6">
                          <div className="space-y-3">
                            {lessonAttempts.map((attempt: any) => (
                              <Card key={attempt.id} className="bg-background">
                                <CardHeader className="pb-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <CardTitle className="text-base mb-2">
                                        {attempt.test?.title || 'Неизвестный тест'}
                  </CardTitle>
                                      <CardDescription className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Студент:</span>
                                          <span>{attempt.user?.name || 'ID: ' + attempt.user_id}</span>
                                          {attempt.user?.email && (
                                            <span className="text-xs">({attempt.user.email})</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm flex-wrap">
                                          <span className="flex items-center gap-1">
                                            <span className="font-medium">Балл:</span>
                                            <span className={`font-semibold ${
                                              attempt.score >= 80 ? 'text-green-600' : 
                                              attempt.score >= 60 ? 'text-yellow-600' : 
                                              'text-red-600'
                                            }`}>
                                              {attempt.score.toFixed(1)}%
                                            </span>
                                          </span>
                                          {attempt.grade && (
                                            <span className="flex items-center gap-1">
                                              <span className="font-medium">Оценка:</span>
                                              <span className="font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                                                {attempt.grade.grade}
                                              </span>
                                            </span>
                                          )}
                                          <span className="flex items-center gap-1">
                                            <span className="font-medium">Дата:</span>
                                            <span>{new Date(attempt.created_at).toLocaleDateString('ru-RU', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}</span>
                                          </span>
                                        </div>
                                        {attempt.grade?.comment && (
                                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                            <span className="font-medium">Комментарий:</span> {attempt.grade.comment}
                                          </div>
                                        )}
                  </CardDescription>
                                    </div>
                                  </div>
                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex gap-2 flex-wrap">
                                    <Button 
                                      onClick={() => openGradeDialog(attempt)}
                                      size="sm"
                                      variant={attempt.grade ? "outline" : "default"}
                                    >
                                      {attempt.grade ? 'Изменить оценку' : 'Выставить оценку'}
                  </Button>
                                    <Button 
                                      onClick={() => handleAllowRetake(attempt.id, attempt.user?.name || 'студента')}
                                      size="sm"
                                      variant="destructive"
                                    >
                                      Разрешить пересдачу
                                    </Button>
                                  </div>
                </CardContent>
              </Card>
            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Диалог выставления оценки */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Выставить оценку</DialogTitle>
              <DialogDescription>
                Оцените попытку прохождения теста
              </DialogDescription>
            </DialogHeader>
            
            {selectedAttempt && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Студент:</span>
                    <p className="font-medium">{(selectedAttempt as any).user?.name || 'ID: ' + selectedAttempt.user_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Тест:</span>
                    <p className="font-medium">{(selectedAttempt as any).test?.title || 'Неизвестный тест'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Результат:</span>
                    <p className={`font-semibold ${
                      selectedAttempt.score >= 80 ? 'text-green-600' : 
                      selectedAttempt.score >= 60 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {selectedAttempt.score.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Дата:</span>
                    <p className="font-medium text-sm">
                      {new Date(selectedAttempt.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="grade" className="text-base font-semibold">
                  Оценка (балл) *
                </Label>
                <Input
                  id="grade"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  placeholder="Введите оценку (например, 5 или 85)"
                  className="mt-2"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Укажите оценку по вашей шкале оценивания
                </p>
              </div>
              <div>
                <Label htmlFor="comment" className="text-base font-semibold">
                  Комментарий (необязательно)
                </Label>
                <textarea
                  id="comment"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2 resize-none"
                  value={gradeData.comment}
                  onChange={(e) => setGradeData({ ...gradeData, comment: e.target.value })}
                  placeholder="Добавьте комментарий для студента..."
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateGrade} className="shadow-md">
                Выставить оценку
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

