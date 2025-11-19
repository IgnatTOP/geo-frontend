import { useEffect, useState, useMemo } from 'react'
import { FullPageLoading } from '@/components/ui/loading'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getPractices, createPractice, updatePractice, deletePractice, getAllPracticeSubmits, createPracticeGrade } from '@/services/practices'
import { getLessons } from '@/services/lessons'
import type { Practice, PracticeSubmit } from '@/services/practices'
import type { Lesson } from '@/services/lessons'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import FileUpload from '@/components/FileUpload'
import Link from 'next/link'

/**
 * Страница управления практическими заданиями (админка)
 */
export default function AdminPracticesPage() {
  const { user, isAuth } = useAuth()
  const { success, error: showError } = useToast()
  const [practices, setPractices] = useState<Practice[]>([])
  const [submits, setSubmits] = useState<PracticeSubmit[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'practices' | 'submits'>('practices')
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [selectedSubmit, setSelectedSubmit] = useState<PracticeSubmit | null>(null)
  const [formData, setFormData] = useState({ lesson_id: '', title: '', file_url: '' })
  const [gradeData, setGradeData] = useState({ user_id: '', practice_id: '', submit_id: '', grade: '', comment: '' })

  // Группировка практик по урокам
  const practicesByLesson = useMemo(() => {
    const grouped: Record<number, Practice[]> = {}
    practices.forEach((practice) => {
      if (!grouped[practice.lesson_id]) {
        grouped[practice.lesson_id] = []
      }
      grouped[practice.lesson_id].push(practice)
    })
    return grouped
  }, [practices])

  // Группировка отправок по урокам
  const submitsByLesson = useMemo(() => {
    const grouped: Record<number, PracticeSubmit[]> = {}
    submits.forEach((submit: any) => {
      const lessonId = submit.practice?.lesson_id
      if (lessonId) {
        if (!grouped[lessonId]) {
          grouped[lessonId] = []
        }
        grouped[lessonId].push(submit)
      }
    })
    return grouped
  }, [submits])

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
      if (activeTab === 'practices') {
        const data = await getPractices()
        setPractices(data)
      } else {
        const data = await getAllPracticeSubmits()
        setSubmits(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.lesson_id) {
      showError('Выберите урок')
      return
    }
    try {
      await createPractice({
        lesson_id: parseInt(formData.lesson_id),
        title: formData.title,
        file_url: formData.file_url,
      })
      success(`Практическое задание "${formData.title}" успешно создано`)
      setIsDialogOpen(false)
      setFormData({ lesson_id: '', title: '', file_url: '' })
      loadData()
    } catch (error) {
      console.error('Ошибка создания практики:', error)
      showError('Не удалось создать практическое задание')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить практическое задание?')) return
    try {
      await deletePractice(id)
      success('Практическое задание успешно удалено')
      loadData()
    } catch (error) {
      console.error('Ошибка удаления практики:', error)
      // Ошибка уже обработана в API интерцепторе
    }
  }

  const handleCreateGrade = async () => {
    try {
      await createPracticeGrade({
        user_id: parseInt(gradeData.user_id),
        practice_id: parseInt(gradeData.practice_id),
        submit_id: gradeData.submit_id ? parseInt(gradeData.submit_id) : undefined,
        grade: parseFloat(gradeData.grade),
        comment: gradeData.comment || undefined,
      })
      success('Оценка успешно выставлена')
      setIsGradeDialogOpen(false)
      setGradeData({ user_id: '', practice_id: '', submit_id: '', grade: '', comment: '' })
      setSelectedSubmit(null)
      loadData()
    } catch (error) {
      console.error('Ошибка создания оценки:', error)
      // Ошибка уже обработана в API интерцепторе
    }
  }

  const openGradeDialog = (submit: PracticeSubmit) => {
    setSelectedSubmit(submit)
    setGradeData({
      user_id: submit.user_id.toString(),
      practice_id: submit.practice_id.toString(),
      submit_id: submit.id.toString(),
      grade: '',
      comment: '',
    })
    setIsGradeDialogOpen(true)
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
          <h1 className="text-3xl font-bold">Управление практиками</h1>
          <Link href="/admin">
            <Button variant="outline">Назад</Button>
          </Link>
        </div>

        {/* Вкладки */}
        <div className="flex gap-4 mb-6 border-b pb-0">
          <button
            className={`pb-3 px-6 font-semibold transition-all ${
              activeTab === 'practices' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('practices')}
          >
            Практики
          </button>
          <button
            className={`pb-3 px-6 font-semibold transition-all ${
              activeTab === 'submits' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('submits')}
          >
            Отправки студентов
          </button>
        </div>

        {/* Список практик */}
        {activeTab === 'practices' && (
          <>
            <div className="mb-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({ lesson_id: '', title: '', file_url: '' })}>
                    Создать практику
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать практическое задание</DialogTitle>
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
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="file_url">Файл задания</Label>
                      <div className="space-y-2">
                        <Input
                          id="file_url"
                          type="url"
                          placeholder="Или введите URL файла"
                          value={formData.file_url}
                          onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                        />
                        <FileUpload
                          onUpload={(url) => setFormData({ ...formData, file_url: url })}
                          accept=".pdf,.doc,.docx,.txt"
                          type="practice"
                          label="Загрузить файл задания"
                        />
                        <p className="text-xs text-muted-foreground">
                          Загрузите файл или введите URL
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleCreate}>Создать</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Группировка практик по урокам */}
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
                  const lessonPractices = practicesByLesson[lesson.id] || []
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
                              Практик: {lessonPractices.length}
                            </p>
                          </div>
                          <div className="text-2xl text-muted-foreground">
                            {isExpanded ? '−' : '+'}
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t bg-muted/20 p-6">
                          {lessonPractices.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              Практик для этого урока пока нет
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {lessonPractices.map((practice: any) => (
                                <Card key={practice.id} className="flex flex-col h-full">
                                  <CardHeader className="flex-1">
                                    <CardTitle className="text-lg line-clamp-2">
                                      {practice.title || 'Практическое задание'}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      {practice.file_url && (() => {
                                        const normalizedUrl = normalizeFileUrl(practice.file_url) || practice.file_url
                                        return (
                                          <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                                            <Button variant="outline" className="w-full" size="sm">
                                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              Файл задания
                                            </Button>
                                          </a>
                                        )
                                      })()}
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(practice.id)}
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
            
            {practices.length === 0 && lessons.length > 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Практики пока не добавлены</p>
                  <Button onClick={() => setIsDialogOpen(true)}>Создать первую практику</Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Список отправок по урокам */}
        {activeTab === 'submits' && (
          <div className="space-y-4">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Всего отправок: <span className="font-semibold text-foreground">{submits.length}</span>
              </p>
            </div>

            {lessons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Уроки не найдены</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const lessonSubmits = submitsByLesson[lesson.id] || []
                  const isExpanded = selectedLesson === lesson.id
                  
                  if (lessonSubmits.length === 0) return null
                  
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
                              Отправок: {lessonSubmits.length}
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
                            {lessonSubmits.map((submit: any) => (
                              <Card key={submit.id} className="bg-background">
                                <CardHeader className="pb-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <CardTitle className="text-base mb-2">
                                        {submit.practice?.title || 'Практическое задание'}
                                      </CardTitle>
                                      <CardDescription className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Студент:</span>
                                          <span>{submit.user?.name || 'ID: ' + submit.user_id}</span>
                                          {submit.user?.email && (
                                            <span className="text-xs">({submit.user.email})</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                          <span className="flex items-center gap-1">
                                            <span className="font-medium">Дата:</span>
                                            <span>{new Date(submit.created_at).toLocaleDateString('ru-RU', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}</span>
                                          </span>
                                        </div>
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex gap-2 flex-wrap">
                                    {(() => {
                                      const normalizedUrl = normalizeFileUrl(submit.file_url) || submit.file_url
                                      return (
                                        <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                                          <Button variant="outline" size="sm">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Открыть файл
                                          </Button>
                                        </a>
                                      )
                                    })()}
                                    <Button 
                                      onClick={() => openGradeDialog(submit)}
                                      size="sm"
                                    >
                                      Выставить оценку
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

            {submits.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Отправок пока нет</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Диалог выставления оценки */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выставить оценку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="grade">Оценка</Label>
                <Input
                  id="grade"
                  type="number"
                  step="0.1"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="comment">Комментарий</Label>
                <textarea
                  id="comment"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={gradeData.comment}
                  onChange={(e) => setGradeData({ ...gradeData, comment: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateGrade}>Выставить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

