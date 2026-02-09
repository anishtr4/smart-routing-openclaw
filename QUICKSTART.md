# 🚀 Smart LLM Router - Quick Start

**Your complete OpenClaw plugin for intelligent, cost-optimized LLM routing**

---

## What You've Got

A production-ready OpenClaw plugin that:

✅ **Routes intelligently** - Analyzes prompts and picks the cheapest capable model  
✅ **Saves 78-96%** - Compared to using premium models for everything  
✅ **Supports 4 providers** - Anthropic, Google, Groq, OpenAI  
✅ **Tracks costs** - Detailed statistics on spending  
✅ **User-friendly** - Easy API key configuration  

---

## Installation (5 Minutes)

### Step 1: Install Dependencies
```bash
cd smart-router-plugin
npm install
```

### Step 2: Get API Keys

**Start FREE with Groq:**
- Go to https://console.groq.com
- Sign up (free)
- Create API key → `gsk_...`

**Add Google (also FREE):**
- Go to https://aistudio.google.com/apikey
- Create API key

**Add Anthropic for quality ($10-20):**
- Go to https://console.anthropic.com
- Add credits
- Create API key → `sk-ant-...`

### Step 3: Configure

Add to `~/.bashrc` or `~/.zshrc`:
```bash
export GROQ_API_KEY="gsk_..."
export GOOGLE_API_KEY="..."
export ANTHROPIC_API_KEY="sk-ant-..."  # Optional at first
```

Then: `source ~/.bashrc`

### Step 4: Install Plugin
```bash
# Run the install script
./install.sh

# Or manually:
npm run build
openclaw plugin install $(pwd)
```

### Step 5: Use It!
```bash
# Enable auto-routing
openclaw config set model smart-router/auto

# Try it
openclaw chat "What is 2+2?"
openclaw chat "Build a React todo app"
openclaw chat "Prove sqrt(2) is irrational"
```

---

## File Structure

```
smart-router-plugin/
├── src/
│   ├── index.ts          # Plugin entry point
│   ├── router.ts         # Routing engine (14 dimensions)
│   ├── provider.ts       # LLM API abstraction
│   ├── models.ts         # Model definitions + pricing
│   ├── cost-tracker.ts   # Cost tracking
│   └── types.ts          # TypeScript types
├── README.md             # Full documentation
├── SETUP.md              # Detailed setup guide
├── COST-COMPARISON.md    # vs other solutions
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── openclaw.plugin.json  # Plugin manifest
├── install.sh            # Quick install script
└── test-router.ts        # Test routing logic
```

---

## Key Features

### 1. Intelligent Routing

14-dimension analysis:
- Reasoning markers (18%)
- Code presence (15%)
- Simple indicators (12%)
- Multi-step patterns (12%)
- Technical terms (10%)
- And 9 more...

### 2. Four Tiers

| Tier | Model | Cost | Use Case |
|------|-------|------|----------|
| SIMPLE | Groq Llama | $0.69/M | Basic questions |
| MEDIUM | Gemini Flash | $0.25/M | General tasks |
| COMPLEX | Claude Sonnet | $9/M | Advanced coding |
| REASONING | DeepSeek | $1.37/M | Deep logic |

### 3. Cost Tracking

```bash
openclaw router-stats
```

Shows:
- Total requests and cost
- Cost by tier
- Cost by provider
- Token usage

### 4. Flexible Configuration

```yaml
# ~/.openclaw/config.yaml
plugins:
  - id: "@local/smart-llm-router"
    config:
      defaultTier: "medium"
      enableLogging: true
      costTracking: true
```

---

## Usage Examples

### Auto Routing (Recommended)
```bash
openclaw config set model smart-router/auto
openclaw chat "Your prompt"
```

### Force a Tier
```bash
# Always use cheapest
openclaw config set model smart-router/simple

# Balanced
openclaw config set model smart-router/medium

# High quality
openclaw config set model smart-router/complex
```

### Specific Model
```bash
openclaw config set model smart-router/claude-sonnet-4.5
openclaw config set model smart-router/gemini-1.5-flash
```

---

## Cost Optimization Tips

### Start Free
1. Sign up for Groq (free)
2. Sign up for Google (free)
3. Use `simple` and `medium` tiers
4. **Cost: $0/month**

### Add Quality When Needed
1. Add Anthropic API ($10-20)
2. Use `auto` routing
3. Let router optimize
4. **Cost: $10-25/month**

### Monitor Spending
```bash
# Check stats regularly
openclaw router-stats

# Reset when needed
openclaw router-reset
```

---

## Testing

```bash
# Test routing logic (no API calls)
npm run test-router

# Test with real API
openclaw chat "Test prompt"
```

---

## With Continue.dev (Coding)

1. Install Continue.dev in VSCode
2. Configure:
```json
{
  "models": [{
    "title": "Smart Router",
    "provider": "openai",
    "model": "smart-router/auto",
    "apiBase": "http://localhost:8000"
  }]
}
```
3. Start proxy: `openclaw serve --port 8000`

---

## Troubleshooting

### "No API keys configured"
```bash
# Check environment
echo $GROQ_API_KEY
echo $GOOGLE_API_KEY

# Reload shell
source ~/.bashrc
```

### "Provider not configured"
Router tried a provider you don't have. Either:
1. Add that API key, or
2. Force a different tier:
   ```bash
   openclaw config set model smart-router/simple
   ```

### Build errors
```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

---

## Budget Planning

### $0/month (Free Tier)
- Groq + Google APIs
- Handle simple + medium tasks
- ~5-10M tokens/month

### $10-15/month (Add Anthropic)
- All tiers available
- Smart routing active
- ~8-12M tokens/month

### $25-30/month (Heavy Use)
- Unlimited routing
- All providers
- ~15-20M tokens/month

---

## Next Steps

1. ✅ Install and configure
2. ✅ Test with simple prompts
3. ✅ Check routing decisions
4. ✅ Monitor costs with `router-stats`
5. ✅ Adjust tiers if needed
6. ✅ Integrate with Continue.dev for coding

---

## Documentation

- **README.md** - Full documentation
- **SETUP.md** - Detailed setup guide
- **COST-COMPARISON.md** - vs alternatives

---

## Support

Having issues?
1. Check the SETUP.md troubleshooting section
2. Verify API keys are valid
3. Check OpenClaw logs for errors
4. Test routing logic: `npm run test-router`

---

## Summary

**For $30/month:**

Smart Router gives you:
- 🎯 15-20M intelligently routed tokens
- 💰 78-96% cost savings
- 🔧 Full API control
- 📊 Detailed tracking
- 🚀 Works everywhere (coding + automation)

**vs Cursor Pro alone ($20):**
- Only works in editor
- Need extra $$ for automation
- No cost optimization

**vs Direct APIs ($30):**
- ~5M tokens with premium models
- No intelligent routing
- Manual model switching

---

**You're ready to save money while using the best models! 🎉**

Start with: `./install.sh`
