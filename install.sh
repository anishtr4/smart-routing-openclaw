#!/bin/bash

# Smart LLM Router - Quick Install Script

echo "🚀 Smart LLM Router - Quick Install"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. You have version $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if OpenClaw is installed
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw is not installed."
    echo ""
    echo "Install OpenClaw first:"
    echo "   npm install -g openclaw"
    echo ""
    exit 1
fi

echo "✅ OpenClaw detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build
echo "🔨 Building plugin..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Link plugin
echo "🔗 Linking plugin..."
npm link

if [ $? -ne 0 ]; then
    echo "❌ Failed to link plugin"
    exit 1
fi

echo "✅ Plugin linked"
echo ""

# Get current directory
PLUGIN_DIR=$(pwd)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Install the plugin in OpenClaw:"
echo "   openclaw plugin install $PLUGIN_DIR"
echo ""
echo "2. Configure API keys (choose one method):"
echo ""
echo "   Method A: Environment variables (add to ~/.bashrc or ~/.zshrc):"
echo "   export GROQ_API_KEY='gsk_...'"
echo "   export GOOGLE_API_KEY='...'"
echo "   export ANTHROPIC_API_KEY='sk-ant-...'"
echo ""
echo "   Method B: Config file (~/.openclaw/config.yaml):"
echo "   See SETUP.md for details"
echo ""
echo "3. Use it:"
echo "   openclaw config set model smart-router/auto"
echo "   openclaw chat 'What is 2+2?'"
echo ""
echo "📚 For detailed setup guide, see: SETUP.md"
echo "📖 For full documentation, see: README.md"
echo ""
echo "💡 Get API keys (at least one required):"
echo "   Groq (FREE):      https://console.groq.com"
echo "   Google (FREE):    https://aistudio.google.com/apikey"
echo "   Anthropic (PAID): https://console.anthropic.com"
echo "   OpenAI (PAID):    https://platform.openai.com"
echo ""
