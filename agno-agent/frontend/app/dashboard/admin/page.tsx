"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface KnowledgeDocument {
  id: string
  name: string
  content?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Fetch documents from AgentOS Knowledge API
  // Reference: https://docs.agno.com/reference-api/knowledge/list-content
  const { data: documents, isLoading } = useQuery<KnowledgeDocument[]>({
    queryKey: ['knowledge-documents'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const response: any = await api.knowledge.list(token)
      // AgentOS returns { data: [...], meta: {...} }
      if (response.data && Array.isArray(response.data)) {
        return response.data
      }
      // Fallback for direct array
      return Array.isArray(response) ? response : []
    },
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return api.knowledge.upload(file, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
      toast.success('Document uploaded successfully')
      setUploadDialogOpen(false)
      setSelectedFile(null)
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return api.knowledge.delete(documentId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
      toast.success('Document deleted')
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`)
    },
  })

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      await uploadMutation.mutateAsync(selectedFile)
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (metadata?: Record<string, any>) => {
    const status = metadata?.status || 'ready'
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      ready: 'default',
      processing: 'secondary',
      failed: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base Management</h2>
          <p className="text-muted-foreground">
            Upload and manage documents for the AI helpdesk
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a document to add to the knowledge base. Supported formats: TXT, PDF
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".txt,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setSelectedFile(file)
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileText className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </span>
                </label>
              </div>
              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            All documents in the knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents yet. Upload your first document to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{getStatusBadge(doc.metadata)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {doc.metadata?.type || doc.metadata?.document_type || 'document'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(doc.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(doc.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


