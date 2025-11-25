"use client"

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, FileText, User, Bot } from 'lucide-react'
import { toast } from 'sonner'

interface Citation {
  document_id: string
  document_name: string
  chunk_text: string
  relevance_score: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export default function ChatPage() {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return api.chat.send(message, sessionId, token)
    },
    onSuccess: (response: any) => {
      // AgentOS RunOutput format: { run_id, session_id, content, messages, metrics, references, ... }
      setSessionId(response.session_id)
      
      // Extract citations from references if available
      const citations = response.references?.map((ref: any) => ({
        document_id: ref.document_id || ref.id,
        document_name: ref.name || ref.document_name || 'Unknown',
        chunk_text: ref.content || ref.chunk_text || '',
        relevance_score: ref.score || ref.relevance_score || 0,
      })) || []
      
      setMessages((prev) => [
        ...prev,
        {
          id: response.run_id || Date.now().toString(),
          role: 'assistant',
          content: response.content || response.message || '',
          citations: citations,
        },
      ])
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMessage.isPending) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])

    // Send to backend
    sendMessage.mutate(input)
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <Bot className="h-16 w-16 mx-auto text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold">Welcome to Electrodry AI Helpdesk</h3>
                <p className="text-gray-600 mt-2">
                  Ask me anything about our services, pricing, or procedures.
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-[70%] space-y-2`}>
                <Card className={message.role === 'user' ? 'bg-blue-600 text-white' : ''}>
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>

                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Sources:
                    </p>
                    {message.citations.map((citation, idx) => (
                      <Card key={idx} className="bg-gray-50">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {citation.document_name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {citation.chunk_text}
                              </p>
                            </div>
                            <Badge variant="secondary" className="flex-shrink-0">
                              {Math.round(citation.relevance_score * 100)}%
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {sendMessage.isPending && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            <Card>
              <CardContent className="p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="h-[60px] w-[60px]"
            disabled={!input.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}


