import { useEffect, useState } from 'react'
import { FullPageLoading } from '@/components/ui/loading'
import { useAuth } from '@/context/AuthContext'
import { FullPageLoading } from '@/components/ui/loading'
import { useToast } from '@/context/ToastContext'
import { FullPageLoading } from '@/components/ui/loading'
import { getPractices, createPractice, updatePractice, deletePractice, getAllPracticeSubmits, createPracticeGrade } from '@/services/practices'
import { FullPageLoading } from '@/components/ui/loading'
import { getLessons } from '@/services/lessons'
import { FullPageLoading } from '@/components/ui/loading'
import type { Practice, PracticeSubmit } from '@/services/practices'
import { FullPageLoading } from '@/components/ui/loading'
import type { Lesson } from '@/services/lessons'
import { FullPageLoading } from '@/components/ui/loading'
import { normalizeFileUrl } from '@/services/upload'
import { FullPageLoading } from '@/components/ui/loading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FullPageLoading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { FullPageLoading } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { FullPageLoading } from '@/components/ui/loading'
import { Label } from '@/components/ui/label'
import { FullPageLoading } from '@/components/ui/loading'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FullPageLoading } from '@/components/ui/loading'
import FileUpload from '@/components/FileUpload'
import { FullPageLoading } from '@/components/ui/loading'
import Link from 'next/link'
import { FullPageLoading } from '@/components/ui/loading'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [selectedSubmit, setSelectedSubmit] = useState<PracticeSubmit | null>(null)
  const [formData, setFormData] = useState({ lesson_id: '', title: '', file_url: '' })
  const [gradeData, setGradeData] = useState({ user_id: '', practice_id: '', submit_id: '', grade: '', comment: '' })

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
      success('Практическое задание успешно создано')
      setIsDialogOpen(false)
      setFormData({ lesson_id: '', title: '', file_url: '' })
      loadData()
    } catch (error) {
      console.error('Ошибка создания практики:', error)
      // Ошибка уже обработана в API интерцепторе
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
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-2 px-4 ${activeTab === 'practices' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('practices')}
          >
            Практики
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'submits' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('submits')}
          >
            Отправки
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practices.map((practice: any) => (
                <Card key={practice.id}>
                  <CardHeader>
                    <CardTitle>{practice.title}</CardTitle>
                    <CardDescription>
                      {practice.lesson ? `Урок ${practice.lesson.number}: ${practice.lesson.topic}` : `Урок ID: ${practice.lesson_id}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {practice.file_url && (() => {
                      const normalizedUrl = normalizeFileUrl(practice.file_url) || practice.file_url
                      return (
                        <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="outline" className="w-full">Файл задания</Button>
                        </a>
                      )
                    })()}
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(practice.id)}
                      className="w-full"
                    >
                      Удалить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {practices.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Практики пока не добавлены</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Список отправок */}
        {activeTab === 'submits' && (
          <div className="space-y-4">
            {submits.map((submit: any) => (
              <Card key={submit.id}>
                <CardHeader>
                  <CardTitle>
                    {submit.practice?.title || 'Практика'}
                  </CardTitle>
                  <CardDescription>
                    Пользователь: {submit.user?.name || 'ID: ' + submit.user_id} ({submit.user?.email || ''}) | 
                    Дата: {new Date(submit.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {(() => {
                    const normalizedUrl = normalizeFileUrl(submit.file_url) || submit.file_url
                    return (
                  <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                    <Button variant="outline">Открыть файл</Button>
                  </a>
                    )
                  })()}
                  <Button onClick={() => openGradeDialog(submit)}>
                    Выставить оценку
                  </Button>
                </CardContent>
              </Card>
            ))}
            {submits.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
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

