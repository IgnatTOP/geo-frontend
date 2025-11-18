import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import type { User } from '@/services/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

/**
 * Страница управления пользователями (админка)
 */
export default function AdminUsersPage() {
  const { user, isAuth } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student' })

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadUsers()
  }, [isAuth, user])

  const loadUsers = async () => {
    try {
      const response = await api.get<User[]>('/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: formData.name || editingUser.name,
        email: formData.email || editingUser.email,
        role: formData.role || editingUser.role,
      })
      setIsDialogOpen(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', role: 'student' })
      loadUsers()
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      alert('Ошибка обновления пользователя')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      loadUsers()
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
      alert('Ошибка удаления пользователя')
    }
  }

  const openEditDialog = (userData: User) => {
    setEditingUser(userData)
    setFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role,
    })
    setIsDialogOpen(true)
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
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <Link href="/admin">
            <Button variant="outline">Назад</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {users.map((userData) => (
            <Card key={userData.id}>
              <CardHeader>
                <CardTitle>{userData.name}</CardTitle>
                <CardDescription>
                  Email: {userData.email} | Роль: {userData.role === 'admin' ? 'Администратор' : 'Студент'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditDialog(userData)}
                  className="flex-1"
                >
                  Редактировать
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(userData.id)}
                  className="flex-1"
                  disabled={userData.id === user?.id}
                >
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Диалог редактирования */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Роль</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Студент</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdate}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

