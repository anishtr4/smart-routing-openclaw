# 🚀 Smart LLM Router for OpenClaw

**Intelligent cost-optimized routing** across Claude, Gemini, Groq, and OpenAI models.

Save **78-96%** on LLM costs by automatically routing requests to the most cost-effective model that can handle each task.

## ⚡ Quick Install

```bash
# Install directly from GitHub
openclaw plugins install https://github.com/anishtr4/smart-routing-openclaw.git

# Configure API keys (at least one required)
export GROQ_API_KEY="gsk_..."          # FREE - Start here!
export GOOGLE_API_KEY="..."            # FREE
export ANTHROPIC_API_KEY="sk-ant-..."  # Paid ($10-20)

# Enable smart routing
openclaw config set model smart-router/auto

# Start using!
openclaw chat "Build a React todo app"
```

## 🎯 Features

✅ **Smart Routing** - Analyzes prompts and picks the cheapest capable model  
✅ **Multi-Provider** - Supports Anthropic, Google, Groq, and OpenAI  
✅ **Cost Tracking** - Detailed statistics on spending by tier and provider  
✅ **Flexible Configuration** - Environment variables or config file  
✅ **Zero Setup** - Install and go!

## 📋 Table of Contents

- [Get API Keys](#get-api-keys)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [CLI Commands](#cli-commands)
- [Cost Savings](#cost-savings)
- [Troubleshooting](#troubleshooting)

---

## 🔑 Get API Keys

You need **at least one** API key. Start with the free options!

### Groq (FREE - Recommended to start!)
1. Go to https://console.groq.com
2. Sign up (free)
3. Create API key → `gsk_...`

### Google Gemini (FREE)
1. Go to https://aistudio.google.com/apikey
2. Create API key

### Anthropic Claude (Paid, for complex tasks)
1. Go to https://console.anthropic.com
2. Add $10-20 credits
3. Create API key → `sk-ant-...`

### OpenAI (Optional)
1. Go to https://platform.openai.com
2. Add billing
3. Create API key → `sk-...`

---

## 📦 Installation

### Method 1: Direct from GitHub (Easiest)

```bash
openclaw plugins install https://github.com/anishtr4/smart-routing-openclaw.git
```

### Method 2: Local Installation

```bash
# Clone the repository
git clone https://github.com/anishtr4/smart-routing-openclaw.git
cd smart-routing-openclaw

# Install and build
npm install
npm run build

# Install to OpenClaw
openclaw plugins install $(pwd)
```

You should see:
```
🚀 Smart LLM Router initializing...
✅ Configured providers: Groq, Google, Anthropic
📊 Cost tracking enabled
✅ Smart LLM Router ready!
```

---

## ⚙️ Configuration

### Option A: Environment Variables (Recommended)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
export GROQ_API_KEY="gsk_..."
export GOOGLE_API_KEY="..."
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."  # Optional
```

Then reload: `source ~/.bashrc`

### Option B: Config File

Create `~/.openclaw/config.yaml`:

```yaml
plugins:
  - id: "@local/smart-llm-router"
    config:
      groqApiKey: "gsk_..."
      googleApiKey: "..."
      anthropicApiKey: "sk-ant-..."
      # Optional settings
      defaultTier: "medium"
      enableLogging: true
      costTracking: true
```

---

## 🎮 Usage

### Auto Routing (Recommended)

```bash
# Enable automatic routing
openclaw config set model smart-router/auto

# Use it!
openclaw chat "What is 2+2?"                    # → Groq (simple)
openclaw chat "Build a React todo app"          # → Claude Sonnet (complex)
openclaw chat "Prove sqrt(2) is irrational"     # → Reasoning tier
```

### Force a Tier

```bash
# Always use cheapest models
openclaw config set model smart-router/simple

# Balanced quality/cost
openclaw config set model smart-router/medium

# High quality
openclaw config set model smart-router/complex

# Maximum capability
openclaw config set model smart-router/reasoning
```

### Force a Specific Model

```bash
openclaw config set model smart-router/claude-sonnet-4.5
openclaw config set model smart-router/gemini-1.5-flash
openclaw config set model smart-router/gpt-4o-mini
```

---

## 🧠 How It Works

The router analyzes your prompt using **14 weighted dimensions**:

1. **Reasoning markers** (18%) - "prove", "theorem", "step by step"
2. **Code presence** (15%) - "function", "async", code blocks
3. **Simple indicators** (12%) - "what is", "define"
4. **Multi-step patterns** (12%) - "first", "then", numbered steps
5. **Technical terms** (10%) - "algorithm", "kubernetes"
6. **Token count** (8%) - Length of prompt
7. **Creative markers** (5%) - "story", "poem", "brainstorm"
8. Plus 7 more dimensions...

### Four Intelligent Tiers

| Tier | Primary Model | Cost/M Tokens | Use Case |
|------|--------------|---------------|----------|
| **SIMPLE** | Groq Llama 3.1 70B | $0.59/$0.79 | Basic questions, simple tasks |
| **MEDIUM** | Gemini 2.0 Flash | $0.10/$0.40 | Balanced tasks, general coding |
| **COMPLEX** | Claude Sonnet 4.5 | $3/$15 | Advanced coding, architecture |
| **REASONING** | DeepSeek Reasoner | $0.55/$2.19 | Proofs, deep logic |

### Available Models by Tier

**SIMPLE (Cheapest)**
- ✅ Groq Llama 3.1 70B - $0.59/$0.79/M
- ✅ Gemini 1.5 Flash - $0.075/$0.30/M

**MEDIUM (Balanced)**
- ✅ Gemini 2.0 Flash - $0.10/$0.40/M
- ✅ GPT-4o Mini - $0.15/$0.60/M
- ✅ Claude Haiku 4.5 - $1/$5/M

**COMPLEX (High Quality)**
- ✅ Gemini 2.5 Pro - $1.25/$10/M
- ✅ GPT-4o - $2.50/$10/M
- ✅ Claude Sonnet 4.5 - $3/$15/M

**REASONING (Maximum Capability)**
- ✅ DeepSeek Reasoner - $0.55/$2.19/M
- ✅ OpenAI o3-mini - $1.10/$4.40/M
- ✅ Claude Opus 4.5 - $15/$75/M

---

## 📊 CLI Commands

### View Statistics

```bash
openclaw router-stats
```

Output:
```
📊 Smart Router Statistics:

Total Requests: 127
Total Cost:     $0.8542
Total Tokens:   2,847,392
Avg Cost/Req:   $0.0067

By Tier:
   SIMPLE     $0.0234 (2.7%)
   MEDIUM     $0.2841 (33.3%)
   COMPLEX    $0.5123 (60.0%)
   REASONING  $0.0344 (4.0%)

By Provider:
   google     $0.3075 (36.0%)
   anthropic  $0.5123 (60.0%)
   groq       $0.0344 (4.0%)
```

### List All Models

```bash
openclaw router-models
```

### Reset Statistics

```bash
openclaw router-reset
```

---

## 💰 Cost Savings

### Example: 100 Requests

**Without Smart Routing** (all Claude Sonnet):
```
100 requests × 10K tokens avg × $9/M = $9.00
```

**With Smart Routing**:
```
45 simple    × 10K tokens × $0.69/M  = $0.31
35 medium    × 10K tokens × $0.25/M  = $0.09
15 complex   × 10K tokens × $9.00/M  = $1.35
5 reasoning  × 10K tokens × $1.37/M  = $0.07
                           Total     = $1.82
```

**💰 Savings: $7.18 (80%)**

### Budget Planning

| Budget | Setup | Expected Usage |
|--------|-------|----------------|
| **$0/month** | Groq + Google (both FREE) | 5-10M tokens/month |
| **$10-15/month** | Add Anthropic | 8-12M tokens/month |
| **$25-30/month** | All providers | 15-20M tokens/month |

---

## 🔧 Troubleshooting

### "No API keys configured"

**Solution:**
```bash
# Check environment variables
echo $GROQ_API_KEY

# Reload shell
source ~/.bashrc

# Verify at least one key is set
```

### "Provider anthropic not configured"

Router tried to use a provider you don't have configured.

**Solution 1:** Add the API key
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Solution 2:** Force a different tier
```bash
openclaw config set model smart-router/simple  # Uses Groq/Google
```

### Plugin installation failed

**Solution:**
```bash
# Make sure OpenClaw is installed
openclaw --version

# Try manual installation
git clone https://github.com/anishtr4/smart-routing-openclaw.git
cd smart-routing-openclaw
npm install
npm run build
openclaw plugins install $(pwd)
```

### Build errors

**Solution:**
```bash
# Check Node.js version (requires 18+)
node --version

# Clean rebuild
npm run clean
rm -rf node_modules
npm install
npm run build
```

### Routing to expensive models too often

**Solution:** Adjust default tier in config
```yaml
plugins:
  - id: "@local/smart-llm-router"
    config:
      defaultTier: "simple"  # or "medium"
```

---

## 🛠️ Development

```bash
# Watch mode for development
npm run dev

# Clean build
npm run clean && npm run build

# Test routing logic
npm run test-router

# Run tests
npm test
```

---

## 🏗️ Architecture

```
User Prompt
    ↓
Router (14-dimension scoring, <1ms)
    ↓
Tier Selection (SIMPLE/MEDIUM/COMPLEX/REASONING)
    ↓
Model Selection (cheapest capable model in tier)
    ↓
Provider API Call
    ↓
Cost Tracking & Statistics
    ↓
Response
```

---

## 📚 Project Structure

```
smart-routing-openclaw/
├── src/
│   ├── index.ts          # Plugin entry point
│   ├── router.ts         # 14-dimension routing engine
│   ├── provider.ts       # Multi-provider API abstraction
│   ├── models.ts         # Model definitions & pricing
│   ├── cost-tracker.ts   # Cost tracking & statistics
│   └── types.ts          # TypeScript types
├── README.md             # This file
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── openclaw.plugin.json  # Plugin manifest
└── install.sh            # Quick install script
```

---

## 🔗 Integration with Continue.dev

Use the router for coding in VSCode:

```json
{
  "models": [
    {
      "title": "Smart Router",
      "provider": "openai",
      "model": "smart-router/auto",
      "apiBase": "http://localhost:8000"
    }
  ]
}
```

Start the proxy:
```bash
openclaw serve --port 8000
```

---

## 🎯 Why This Router?

### vs Direct APIs
- ✅ 78-96% cost savings
- ✅ Automatic optimization
- ✅ No manual model switching

### vs OpenRouter
- ✅ No markup fees (save $5-9/month)
- ✅ Open source routing logic
- ✅ Full control and transparency

### vs Cursor Pro
- ✅ Works for automation, not just coding
- ✅ No rate limits
- ✅ Pay only for what you use

**For $30/month:**
- Smart Router: 15-20M intelligently routed tokens
- OpenRouter: ~10M tokens (20% goes to fees)
- Direct APIs: ~5M tokens (no optimization)

---

## 📄 License

MIT

---

## 🤝 Contributing

Issues and PRs welcome! This is an open-source project designed to save developers money.

---

## ⭐ Quick Start Checklist

- [ ] Get at least one API key (start with Groq - it's free!)
- [ ] Install plugin: `openclaw plugins install https://github.com/anishtr4/smart-routing-openclaw.git`
- [ ] Configure API keys in environment variables
- [ ] Enable routing: `openclaw config set model smart-router/auto`
- [ ] Test it: `openclaw chat "Hello world"`
- [ ] Check stats: `openclaw router-stats`

---

**Made with ❤️ for cost-conscious AI developers**

**Questions?** Open a GitHub issue!
