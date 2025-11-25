#!/bin/bash

# Electrodry AI Helpdesk - Quick Start Script
# This script helps validate your setup before running the application

set -e

echo "🚀 Electrodry AI Helpdesk - Setup Validation"
echo "=============================================="
echo ""

# Check Python version
echo "Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo "✅ Python $PYTHON_VERSION found"
else
    echo "❌ Python 3 not found. Please install Python 3.11 or higher"
    exit 1
fi

# Check Node version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node $NODE_VERSION found"
else
    echo "❌ Node.js not found. Please install Node.js 18 or higher"
    exit 1
fi

# Check uv
echo "Checking uv package manager..."
if command -v uv &> /dev/null; then
    UV_VERSION=$(uv --version)
    echo "✅ uv found: $UV_VERSION"
else
    echo "⚠️  uv not found. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo "✅ uv installed"
fi

echo ""
echo "📋 Environment Files Check"
echo "=========================="

# Check backend .env
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
    
    # Check for required variables
    if grep -q "SUPABASE_URL=" backend/.env && \
       grep -q "SUPABASE_SERVICE_KEY=" backend/.env && \
       grep -q "OPENAI_API_KEY=" backend/.env && \
       grep -q "OPENROUTER_API_KEY=" backend/.env; then
        echo "✅ Required backend environment variables found"
    else
        echo "⚠️  Some required environment variables may be missing in backend/.env"
        echo "   Required: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY"
    fi
else
    echo "❌ backend/.env not found"
    echo "   Copy backend/.env.example to backend/.env and configure it"
    echo "   See SETUP_GUIDE.md for details"
fi

# Check frontend .env.local
if [ -f "frontend/.env.local" ]; then
    echo "✅ frontend/.env.local exists"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=" frontend/.env.local && \
       grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" frontend/.env.local; then
        echo "✅ Required frontend environment variables found"
    else
        echo "⚠️  Some required environment variables may be missing in frontend/.env.local"
        echo "   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    fi
else
    echo "❌ frontend/.env.local not found"
    echo "   Create frontend/.env.local with your Supabase credentials"
    echo "   See SETUP_GUIDE.md for details"
fi

echo ""
echo "📦 Dependencies Check"
echo "===================="

# Check backend dependencies
if [ -d "backend/.venv" ]; then
    echo "✅ Backend virtual environment exists"
else
    echo "⚠️  Backend dependencies not installed"
    echo "   Run: cd backend && uv sync"
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies not installed"
    echo "   Run: cd frontend && npm install"
fi

echo ""
echo "📊 Summary"
echo "=========="
echo ""
echo "Next steps:"
echo "1. If environment files are missing, create them (see SETUP_GUIDE.md)"
echo "2. Set up your Supabase project and run the SQL scripts"
echo "3. Install dependencies if not already installed"
echo "4. Start the backend: cd backend && uv run uvicorn app.main:app --reload"
echo "5. Start the frontend: cd frontend && npm run dev"
echo "6. Access the application at http://localhost:3000"
echo ""
echo "📖 For detailed instructions, see SETUP_GUIDE.md"
echo ""


