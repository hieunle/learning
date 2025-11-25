"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, MessageSquare, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Electrodry AI Helpdesk</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Customer Support
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get instant answers to your questions with our intelligent helpdesk assistant, 
              powered by advanced RAG technology and knowledge base integration.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card>
              <CardHeader>
                <Bot className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Intelligent responses powered by advanced language models
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>RAG Technology</CardTitle>
                <CardDescription>
                  Retrieval-Augmented Generation for accurate, sourced answers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Upload and manage documents for comprehensive support
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Instant Responses</CardTitle>
                <CardDescription>
                  Get answers immediately with session-based conversations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <Card className="max-w-2xl mx-auto bg-blue-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
                <p className="text-lg mb-6 text-blue-100">
                  Join us today and experience the power of AI-driven customer support
                </p>
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg">
                    Sign Up Now - It's Free
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white mt-20 py-8 border-t">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2025 Electrodry AI Helpdesk. Powered by AgentOS.</p>
          </div>
        </footer>
      </div>
    )
  }

  return null
}
