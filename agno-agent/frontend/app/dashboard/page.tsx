"use client"

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, FileText, User, Bot, ChevronDown, Wrench, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Citation {
  document_id: string
  document_name: string
  chunk_text: string
  relevance_score: number
}

interface ToolCall {
  tool_call_id: string
  tool_name: string
  tool_args: any
  status: 'running' | 'completed' | 'failed'
  result?: string
  duration?: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  toolCalls?: ToolCall[]
  isComplete?: boolean
}

interface Agent {
  id: string
  name: string
  description?: string
}

export default function ChatPage() {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string>('helpdesk-assistant')
  const [isStreaming, setIsStreaming] = useState(false)
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null)
  const [expandedToolCall, setExpandedToolCall] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch available agents
  const { data: agentsData, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return api.agents.list(token)
    },
  })

  // AgentOS returns agents array directly, not wrapped in an object
  const agents: Agent[] = Array.isArray(agentsData) ? agentsData : []
  const selectedAgentName = agents.find(a => a.id === selectedAgent)?.name || selectedAgent

  // Streaming message handler
  const sendStreamingMessage = async (message: string) => {
    setIsStreaming(true)
    const assistantMessageId = `assistant-${Date.now()}`
    
    // Add empty assistant message that will be updated with streamed content
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        isComplete: false,
      },
    ])

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      let fullContent = ''
      let currentSessionId = sessionId
      let citations: Citation[] = []
      let toolCalls: Map<string, ToolCall> = new Map()

      // Stream the response
      for await (const chunk of api.agents.runStream(
        selectedAgent,
        message,
        sessionId,
        null,
        token
      )) {
        // Update session ID from first chunk
        if (chunk.session_id && !currentSessionId) {
          currentSessionId = chunk.session_id
          setSessionId(chunk.session_id)
        }

        // Track tool calls started
        if (chunk.event === 'ToolCallStarted' && chunk.tool) {
          const toolCall: ToolCall = {
            tool_call_id: chunk.tool.tool_call_id,
            tool_name: chunk.tool.tool_name,
            tool_args: chunk.tool.tool_args,
            status: 'running',
          }
          toolCalls.set(chunk.tool.tool_call_id, toolCall)
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, toolCalls: Array.from(toolCalls.values()) }
                : msg
            )
          )
        }

        // Track tool calls completed
        if (chunk.event === 'ToolCallCompleted' && chunk.tool) {
          const existing = toolCalls.get(chunk.tool.tool_call_id)
          if (existing) {
            existing.status = chunk.tool.tool_call_error ? 'failed' : 'completed'
            existing.result = chunk.tool.result
            existing.duration = chunk.tool.metrics?.duration
            toolCalls.set(chunk.tool.tool_call_id, existing)
            
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, toolCalls: Array.from(toolCalls.values()) }
                  : msg
              )
            )

            // Extract citations from search_knowledge_base tool result
            if (chunk.tool.tool_name === 'search_knowledge_base' && chunk.tool.result && !chunk.tool.tool_call_error) {
              try {
                // The result might be a JSON string or already parsed
                let resultData = chunk.tool.result
                if (typeof resultData === 'string') {
                  // Try to parse if it's a stringified JSON
                  try {
                    resultData = JSON.parse(resultData)
                  } catch {
                    // Not JSON, might be plain text
                  }
                }

                // If result is an array of references/chunks
                if (Array.isArray(resultData)) {
                  const extractedCitations = resultData.map((item: any) => ({
                    document_id: item.document_id || item.id || 'unknown',
                    document_name: item.document_name || item.name || item.metadata?.name || 'Document',
                    chunk_text: item.content || item.text || item.chunk_text || '',
                    relevance_score: item.score || item.relevance_score || item.similarity || 0,
                  }))

                  if (extractedCitations.length > 0) {
                    citations = extractedCitations
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, citations: extractedCitations }
                          : msg
                      )
                    )
                  }
                }
              } catch (error) {
                console.error('Failed to parse knowledge base results:', error)
              }
            }
          }
        }

        // Only process RunContent events for streaming text
        if (chunk.event === 'RunContent' && chunk.content) {
          fullContent += chunk.content
          
          // Update the message with accumulated content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          )
        }

        // Don't override citations from tool calls with empty RunCompleted data
        // Citations are already captured from search_knowledge_base tool results
      }

      // Mark message as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isComplete: true }
            : msg
        )
      )

      setIsStreaming(false)
    } catch (error: any) {
      console.error('Streaming error:', error)
      toast.error(`Failed to send message: ${error.message}`)
      
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
      setIsStreaming(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])

    const messageToSend = input
    setInput('')

    // Use streaming
    await sendStreamingMessage(messageToSend)
  }

  const handleAgentChange = (newAgentId: string) => {
    if (newAgentId !== selectedAgent) {
      setSelectedAgent(newAgentId)
      // Optionally clear messages when switching agents
      setMessages([])
      setSessionId(null)
      toast.success(`Switched to ${agents.find(a => a.id === newAgentId)?.name || newAgentId}`)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with Agent Selector */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Chat</h2>
            <p className="text-sm text-gray-500">AI-powered assistance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Agent:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-between" disabled={isLoadingAgents}>
                  {isLoadingAgents ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      <span className="truncate">{selectedAgentName}</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[250px]">
                <DropdownMenuLabel>Select Agent</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedAgent} onValueChange={handleAgentChange}>
                  {agents.map((agent) => (
                    <DropdownMenuRadioItem key={agent.id} value={agent.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{agent.name}</span>
                        {agent.description && (
                          <span className="text-xs text-gray-500">{agent.description}</span>
                        )}
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

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
                {/* Tool Calls - Collapsible */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {message.toolCalls.map((toolCall) => {
                      const toolCallKey = `${message.id}-${toolCall.tool_call_id}`
                      const isExpanded = expandedToolCall === toolCallKey
                      
                      return (
                        <Card 
                          key={toolCall.tool_call_id} 
                          className="bg-gray-50 border-l-2 border-l-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setExpandedToolCall(isExpanded ? null : toolCallKey)}
                        >
                          <CardContent className="p-2">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                              )}
                              {toolCall.status === 'running' && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 flex-shrink-0" />
                              )}
                              {toolCall.status === 'completed' && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                              )}
                              {toolCall.status === 'failed' && (
                                <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                              )}
                              <Wrench className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-700 flex-1">{toolCall.tool_name}</span>
                              {toolCall.duration && (
                                <span className="text-[10px] text-gray-500">
                                  {toolCall.duration.toFixed(2)}s
                                </span>
                              )}
                            </div>
                            
                            {isExpanded && (
                              <div className="mt-2 space-y-2 pl-5">
                                {toolCall.tool_args && (
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-medium mb-1">Arguments:</p>
                                    <div className="text-[10px] text-gray-600 font-mono bg-gray-100 p-2 rounded max-h-32 overflow-auto">
                                      {JSON.stringify(toolCall.tool_args, null, 2)}
                                    </div>
                                  </div>
                                )}
                                {toolCall.result && toolCall.status === 'completed' && (
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-medium mb-1">Result:</p>
                                    <div className="text-[10px] text-gray-700 p-2 bg-white rounded border border-gray-200 max-h-48 overflow-auto">
                                      {String(toolCall.result).substring(0, 500)}
                                      {String(toolCall.result).length > 500 ? '...' : ''}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                <Card className={message.role === 'user' ? 'bg-blue-600 text-white' : ''}>
                  <CardContent className="p-4">
                    {message.content ? (
                      message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )
                    ) : (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Citations - Only show after streaming is complete */}
                {message.isComplete && message.citations && message.citations.length > 0 && message.citations.some(c => c.chunk_text) && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="font-medium">Sources ({message.citations.filter(c => c.chunk_text).length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {message.citations.filter(c => c.chunk_text).map((citation, idx) => {
                        const citationKey = `${message.id}-${idx}`
                        return (
                          <Card 
                            key={idx} 
                            className="inline-flex items-center gap-1.5 bg-gray-50 border-l-2 border-l-green-500 cursor-pointer hover:bg-gray-100 transition-colors px-2 py-1.5"
                            onClick={() => setExpandedCitation(citationKey)}
                          >
                            <FileText className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700 font-medium truncate max-w-[200px]">
                              {citation.document_name.replace('.pdf', '')}
                            </span>
                            {citation.relevance_score > 0 && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                {Math.round(citation.relevance_score * 100)}%
                              </Badge>
                            )}
                            <span className="text-gray-400 text-xs">›</span>
                          </Card>
                        )
                      })}
                    </div>

                    {/* Citation Detail Dialog */}
                    {message.citations.filter(c => c.chunk_text).map((citation, idx) => {
                      const citationKey = `${message.id}-${idx}`
                      return (
                        <Dialog 
                          key={citationKey}
                          open={expandedCitation === citationKey} 
                          onOpenChange={(open) => !open && setExpandedCitation(null)}
                        >
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                {citation.document_name}
                              </DialogTitle>
                              <DialogDescription>
                                Knowledge base reference
                                {citation.relevance_score > 0 && (
                                  <span className="ml-2">
                                    • Relevance: {Math.round(citation.relevance_score * 100)}%
                                  </span>
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {citation.chunk_text}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
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
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? (
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


