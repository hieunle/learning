import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Memory } from '../types/memory'
import { memoryService } from '../services/memoryService'
import { Plus, Edit2, Trash2, LogOut } from 'lucide-react'

export default function MemoriesPage() {
  const { user, setUser } = useAuthStore()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [error, setError] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [view, setView] = useState<'mine' | 'shared'>('mine')

  useEffect(() => {
    if (user) {
      fetchMemories()
    }
  }, [user])

  const fetchMemories = async () => {
    try {
      const data = await memoryService.getMemories()
      setMemories(data)
    } catch (error) {
      console.error('Error fetching memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) return

    try {
      setError(null)
      if (editingMemory) {
        await memoryService.updateMemory(editingMemory.id, formData.title, formData.description, isPublic)
      } else {
        await memoryService.createMemory(formData.title, formData.description, isPublic)
      }
      
      setFormData({ title: '', description: '' })
      setShowForm(false)
      setEditingMemory(null)
      setIsPublic(false)
      fetchMemories()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save memory. Please check your database permissions.'
      console.error('Error saving memory:', error)
      setError(message)
    }
  }

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory)
    setFormData({ title: memory.title, description: memory.description })
    setIsPublic(memory.is_public)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return

    try {
      await memoryService.deleteMemory(id)
      fetchMemories()
    } catch (error) {
      console.error('Error deleting memory:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Memories</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Memory
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('mine')}
            className={`px-3 py-2 rounded ${view === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            My Memories
          </button>
          <button
            onClick={() => setView('shared')}
            className={`px-3 py-2 rounded ${view === 'shared' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Shared
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading memories...</div>
        ) : (view === 'mine' ? memories.filter(m => m.user_id === user!.id).length === 0 : memories.filter(m => m.is_public && m.user_id !== user!.id).length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            {view === 'mine' ? 'No memories yet. Create your first memory!' : 'No shared memories yet.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(view === 'mine' ? memories.filter(m => m.user_id === user!.id) : memories.filter(m => m.is_public && m.user_id !== user!.id)).map((memory) => (
              <div key={memory.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
                <p className="text-gray-600 mb-4">{memory.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    {memory.is_public && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Shared</span>
                    )}
                    <button
                      onClick={() => handleEdit(memory)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                {editingMemory ? 'Edit Memory' : 'New Memory'}
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-6 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Share publicly</span>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingMemory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingMemory(null)
                    setFormData({ title: '', description: '' })
                    setIsPublic(false)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}