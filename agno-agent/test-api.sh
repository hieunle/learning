#!/bin/bash

# Quick API Test Script for AgentOS Integration
# This script tests the basic AgentOS endpoints to verify the migration

BASE_URL="http://localhost:8000"
echo "🧪 Testing AgentOS API Integration"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
curl -s "${BASE_URL}/health" | jq '.' || echo "❌ Health check failed"
echo ""

# Test 2: Root Endpoint (shows available endpoints)
echo "2️⃣ Testing Root Endpoint..."
curl -s "${BASE_URL}/" | jq '.' || echo "❌ Root endpoint failed"
echo ""

# Test 3: AgentOS Config
echo "3️⃣ Testing AgentOS Config..."
curl -s "${BASE_URL}/config" | jq '.agents[] | {id, name}' || echo "❌ Config endpoint failed"
echo ""

# Test 4: OpenAPI Docs (just check if accessible)
echo "4️⃣ Checking OpenAPI Docs..."
curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/docs" | grep -q "200" && echo "✅ Docs accessible" || echo "❌ Docs not accessible"
echo ""

echo "=================================="
echo "✨ Basic connectivity tests complete!"
echo ""
echo "📖 To test agent runs, use:"
echo "   curl -X POST '${BASE_URL}/agents/helpdesk-assistant/runs' \\"
echo "        -F 'message=Hello, how can you help me?' \\"
echo "        -F 'stream=false'"
echo ""
echo "📚 Full API documentation: ${BASE_URL}/docs"


