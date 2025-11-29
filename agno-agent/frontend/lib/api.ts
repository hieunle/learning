/**
 * API client for Agno AgentOS built-in endpoints.
 * 
 * AgentOS provides built-in RESTful API endpoints for:
 * - Running agents: POST /agents/{agent_id}/runs
 * - Managing sessions: GET/POST/DELETE /v1/sessions
 * - Managing knowledge: POST /v1/knowledge
 * - Managing memories: GET/POST/DELETE /v1/memories
 * 
 * See: https://docs.agno.com/agent-os/api/usage
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface ApiRequestOptions extends RequestInit {
  token?: string
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...headers,
      ...(fetchOptions.headers as Record<string, string> || {}),
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `API error: ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Health check
  health: () => apiRequest('/health'),

  // AgentOS Knowledge API - https://docs.agno.com/reference-api/knowledge/list-content
  knowledge: {
    // List all knowledge content
    list: (token: string) =>
      apiRequest('/knowledge/content', { 
        method: 'GET',
        token 
      }),
    
    // Upload document to knowledge base using AgentOS API
    // Reference: https://docs.agno.com/reference-api/knowledge/upload-content
    upload: async (file: File, token: string) => {
      const formData = new FormData()
      formData.append('file', file)
      // Optional: Add metadata as JSON string
      // formData.append('metadata', JSON.stringify({ type: 'document' }))

      const response = await fetch(`${API_BASE_URL}/knowledge/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary for multipart
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(error.detail)
      }

      return response.json()
    },

    // Delete knowledge content by ID
    delete: (contentId: string, token: string) =>
      apiRequest(`/knowledge/content/${contentId}`, {
        method: 'DELETE',
        token,
      }),
  },

  // AgentOS Agent Runs API - https://docs.agno.com/agent-os/api/usage
  agents: {
    // List all available agents
    // Reference: https://docs.agno.com/reference-api/schema/agents/list-all-agents
    list: (token: string) =>
      apiRequest('/agents', { 
        method: 'GET',
        token 
      }),

    // Run an agent with AgentOS built-in API (non-streaming)
    // Uses form-based input as per AgentOS specification
    run: async (
      agentId: string,
      message: string,
      sessionId: string | null,
      userId: string | null,
      token: string,
      stream: boolean = false
    ) => {
      const formData = new FormData()
      formData.append('message', message)
      if (sessionId) formData.append('session_id', sessionId)
      if (userId) formData.append('user_id', userId)
      formData.append('stream', stream.toString())

      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Agent run failed' }))
        throw new Error(error.detail)
      }

      return response.json()
    },

    // Run an agent with streaming support
    // Returns an async generator that yields streaming events
    runStream: async function* (
      agentId: string,
      message: string,
      sessionId: string | null,
      userId: string | null,
      token: string
    ): AsyncGenerator<any> {
      const formData = new FormData()
      formData.append('message', message)
      if (sessionId) formData.append('session_id', sessionId)
      if (userId) formData.append('user_id', userId)
      formData.append('stream', 'true')

      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Agent run failed' }))
        throw new Error(error.detail)
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim() === '') continue
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                yield parsed
              } catch (e) {
                console.error('Failed to parse streaming data:', e)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  },

  // AgentOS Sessions API - https://docs.agno.com/reference-api/session/list-sessions
  sessions: {
    // List all sessions
    list: (token: string, userId?: string) => {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      return apiRequest(`/v1/sessions?${params.toString()}`, { token })
    },

    // Get a specific session
    get: (sessionId: string, token: string) =>
      apiRequest(`/v1/sessions/${sessionId}`, { token }),

    // Delete a session
    delete: (sessionId: string, token: string) =>
      apiRequest(`/v1/sessions/${sessionId}`, {
        method: 'DELETE',
        token,
      }),
  },

  // Backward compatibility - alias for agents.run with helpdesk-assistant as default
  chat: {
    send: (message: string, sessionId: string | null, token: string, userId?: string | null, agentId: string = 'helpdesk-assistant') =>
      api.agents.run(agentId, message, sessionId, userId || null, token, false),
  },
}


