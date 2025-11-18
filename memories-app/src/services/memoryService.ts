import { supabase } from '../lib/supabase'
import { Memory } from '../types/memory'

export const memoryService = {
  // Get all memories for the current user
  async getMemories(): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create a new memory
  async createMemory(title: string, description: string, isPublic: boolean = false): Promise<Memory> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to create memories')
    }

    const { data, error } = await supabase
      .from('memories')
      .insert([{ title, description, user_id: user.id, is_public: isPublic }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a memory
  async updateMemory(id: string, title: string, description: string, isPublic: boolean): Promise<Memory> {
    const { data, error } = await supabase
      .from('memories')
      .update({ title, description, is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a memory
  async deleteMemory(id: string): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}