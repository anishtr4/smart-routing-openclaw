# Smart LLM Router for OpenClaw

**Intelligent cost-optimized routing** across Claude, Gemini, Groq, and OpenAI models.

Save **78-96%** on LLM costs by automatically routing requests to the most cost-effective model that can handle each task.

## Features

✅ **Smart Routing** - 14-dimension weighted scoring automatically selects the best model  
✅ **Multi-Provider** - Supports Anthropic, Google, Groq, and OpenAI  
✅ **Cost Tracking** - Detailed statistics on spending by tier and provider  
✅ **Flexible Configuration** - Use environment variables or config file  
✅ **User-Friendly** - Simple setup, works seamlessly with OpenClaw  

## Quick Start

### 1. Install

```bash
# Clone or download this plugin
cd smart-router-plugin

# Install dependencies
npm install

# Build
npm run build

# Link to OpenClaw
npm link
openclaw plugin install /path/to/smart-router-plugin
```

### 2. Configure API Keys

**Option A: Environment Variables** (Recommended)

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY="sk-ant-..."
export GOOGLE_API_KEY="..."
export GROQ_API_KEY="..."
export OPENAI_API_KEY="sk-..."  # Optional
```

**Option B: Plugin Config**

```yaml
# ~/.openclaw/config.yaml
plugins:
  - id: "@local/smart-llm-router"
    config:
      anthropicApiKey: "sk-ant-..."
      googleApiKey: "..."
      groqApiKey: "..."
      openaiApiKey: "sk-..."  # Optional
      enableLogging: true
      costTracking: true
      defaultTier: "medium"
```

**You need at least one API key configured.** Get free API keys:

- **Groq**: https://console.groq.com (FREE tier - generous!)
- **Google**: https://aistudio.google.com/apikey (FREE tier)
- **Anthropic**: https://console.anthropic.com
- **OpenAI**: https://platform.openai.com

### 3. Use It

```bash
# Enable smart routing
openclaw config set model smart-router/auto

# Start chatting - routes automatically!
openclaw chat "What is 2+2?"           # → Groq (simple)
openclaw chat "Build a React app"      # → Claude Sonnet (complex)
openclaw chat "Prove sqrt(2) is irrational"  # → Claude Opus (reasoning)
```

## How Routing Works

The router analyzes your prompt using **14 weighted dimensions**:

1. **Reasoning markers** (18%) - "prove", "theorem", "step by step"
2. **Code presence** (15%) - "function", "async", code blocks
3. **Simple indicators** (12%) - "what is", "define"
4. **Multi-step patterns** (12%) - "first", "then", numbered steps
5. **Technical terms** (10%) - "algorithm", "kubernetes"
6. **Token count** (8%) - Length of prompt
7. **Creative markers** (5%) - "story", "poem", "brainstorm"
8. Plus 7 more dimensions...

Based on the weighted score, it selects one of 4 tiers:

| Tier | Primary Model | Cost/M | Use Case |
|------|--------------|--------|----------|
| **SIMPLE** | Groq Llama 3.1 70B | $0.59/$0.79 | Basic questions, simple tasks |
| **MEDIUM** | Gemini 2.0 Flash | $0.10/$0.40 | Balanced tasks, general coding |
| **COMPLEX** | Claude Sonnet 4.5 | $3/$15 | Advanced coding, architecture |
| **REASONING** | DeepSeek Reasoner | $0.55/$2.19 | Proofs, deep logic |

## Available Models

### Tier: SIMPLE (Cheapest)
- ✅ Groq Llama 3.1 70B - $0.59/$0.79 per 1M tokens
- ✅ Gemini 1.5 Flash - $0.075/$0.30 per 1M tokens

### Tier: MEDIUM (Balanced)
- ✅ Gemini 2.0 Flash - $0.10/$0.40 per 1M tokens
- ✅ GPT-4o Mini - $0.15/$0.60 per 1M tokens
- ✅ Claude Haiku 4.5 - $1/$5 per 1M tokens

### Tier: COMPLEX (High Quality)
- ✅ Gemini 2.5 Pro - $1.25/$10 per 1M tokens
- ✅ GPT-4o - $2.50/$10 per 1M tokens
- ✅ Claude Sonnet 4.5 - $3/$15 per 1M tokens

### Tier: REASONING (Maximum Capability)
- ✅ DeepSeek Reasoner - $0.55/$2.19 per 1M tokens
- ✅ OpenAI o3-mini - $1.10/$4.40 per 1M tokens
- ✅ Claude Opus 4.5 - $15/$75 per 1M tokens

## Model Selection

### Auto Routing (Recommended)
```bash
openclaw config set model smart-router/auto
```

Routes automatically based on prompt complexity.

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

## CLI Commands

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

### List Models
```bash
openclaw router-models
```

### Reset Statistics
```bash
openclaw router-reset
```

## Configuration Options

```yaml
plugins:
  - id: "@local/smart-llm-router"
    config:
      # API Keys (or use env vars)
      anthropicApiKey: ""
      googleApiKey: ""
      groqApiKey: ""
      openaiApiKey: ""
      
      # Routing
      defaultTier: "medium"  # fallback when confidence is low
      
      # Logging
      enableLogging: true    # show routing decisions
      costTracking: true     # track costs and stats
```

## Cost Savings Example

**Typical workload** (100 requests):
- 45% simple tasks
- 35% medium tasks
- 15% complex tasks
- 5% reasoning tasks

### Without Smart Routing (all Claude Sonnet):
```
100 requests × 10K tokens avg × $9/M = $9.00
```

### With Smart Routing:
```
45 requests (simple)    × 10K tokens × $0.69/M  = $0.31
35 requests (medium)    × 10K tokens × $0.25/M  = $0.09
15 requests (complex)   × 10K tokens × $9.00/M  = $1.35
5 requests (reasoning)  × 10K tokens × $1.37/M  = $0.07
                                       Total     = $1.82
```

**Savings: $7.18 (80%)**

## For Use with Continue.dev

The router works seamlessly with Continue.dev for coding:

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

Start the router as a proxy:
```bash
openclaw serve --port 8000
```

## Troubleshooting

### "No API keys configured"
Set at least one API key via environment variable or config file.

### "Provider X not configured"
The router selected a model from a provider you haven't configured. Either:
1. Add that provider's API key, or
2. Use tier selection to avoid that provider

### Routing to expensive models too often
Adjust `defaultTier` to `"simple"` or `"medium"` in config.

## Development

```bash
# Watch mode for development
npm run dev

# Clean build
npm run clean && npm run build

# Run tests (if you add them)
npm test
```

## Architecture

```
User Prompt
    ↓
Router (14-dimension scoring, <1ms)
    ↓
Model Selection (cheapest in tier)
    ↓
Provider Call (Anthropic/Google/Groq/OpenAI)
    ↓
Cost Tracking
    ↓
Response
```

## License

MIT

---

**Made with ❤️ for cost-conscious AI developers**

Questions? Issues? Open a GitHub issue or PR!
