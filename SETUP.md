# Setup Guide - Smart LLM Router

This guide will help you get the Smart LLM Router plugin set up in **5 minutes**.

## Prerequisites

- Node.js 18+ installed
- OpenClaw installed (`npm install -g openclaw`)
- At least one LLM API key

## Step 1: Get API Keys

You need **at least one** API key. We recommend starting with **Groq** (free tier):

### Groq (Recommended - FREE!)
1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key
4. Copy it - looks like `gsk_...`

### Google Gemini (Also FREE!)
1. Go to https://aistudio.google.com/apikey
2. Click "Get API Key"
3. Create a new key
4. Copy it

### Anthropic Claude
1. Go to https://console.anthropic.com
2. Sign up (requires payment method)
3. Go to API Keys
4. Create a key - looks like `sk-ant-...`
5. Add $10-20 credits

### OpenAI (Optional)
1. Go to https://platform.openai.com
2. Sign up
3. Add billing
4. Create API key - looks like `sk-...`

## Step 2: Install the Plugin

```bash
# Navigate to the plugin directory
cd smart-router-plugin

# Install dependencies
npm install

# Build the plugin
npm run build

# You should see a 'dist' folder created
```

## Step 3: Configure API Keys

**Choose ONE method:**

### Method A: Environment Variables (Recommended)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# For Groq (free)
export GROQ_API_KEY="gsk_..."

# For Google (free)
export GOOGLE_API_KEY="..."

# For Anthropic (paid)
export ANTHROPIC_API_KEY="sk-ant-..."

# For OpenAI (paid, optional)
export OPENAI_API_KEY="sk-..."
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

### Method B: Config File

Create `~/.openclaw/config.yaml`:

```yaml
plugins:
  - id: "@local/smart-llm-router"
    config:
      groqApiKey: "gsk_..."
      googleApiKey: "..."
      anthropicApiKey: "sk-ant-..."
      # openaiApiKey: "sk-..."  # Optional
```

## Step 4: Install Plugin to OpenClaw

```bash
# From the plugin directory
npm link

# Then install in OpenClaw
openclaw plugin install /full/path/to/smart-router-plugin

# Example:
# openclaw plugin install /Users/yourname/projects/smart-router-plugin
```

You should see:
```
🚀 Smart LLM Router initializing...
✅ Configured providers: Groq, Google, Anthropic
📊 Cost tracking enabled
✅ Smart LLM Router ready!
```

## Step 5: Use It!

```bash
# Set the model to auto-routing
openclaw config set model smart-router/auto

# Start chatting
openclaw chat "What is the capital of France?"
# → Routes to Groq (simple question)

openclaw chat "Build me a React todo app with TypeScript"
# → Routes to Claude Sonnet (complex coding)

openclaw chat "Prove that sqrt(2) is irrational using contradiction"
# → Routes to reasoning tier
```

## Verify Setup

```bash
# Check available models
openclaw router-models

# You should see ✅ next to providers you configured
# Example:
# SIMPLE:
#   ✅ Llama 3.1 70B (Groq)
#   ✅ Gemini 1.5 Flash
#   ❌ (models from unconfigured providers)

# View current stats
openclaw router-stats
```

## Budget-Friendly Setup

**For maximum cost savings with minimal spend:**

1. **Start with Groq only** (FREE)
   ```bash
   export GROQ_API_KEY="gsk_..."
   ```

2. **Add Google Gemini** (FREE)
   ```bash
   export GOOGLE_API_KEY="..."
   ```

3. **Add Anthropic for quality** ($10-20)
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

With just Groq + Google (both FREE), you can handle:
- ✅ Simple tasks (Groq)
- ✅ Medium tasks (Google)
- ❌ Complex tasks (need Anthropic/OpenAI)

**Monthly cost: $0 for basic usage, $10-30 if you add Anthropic**

## Tier Behavior Without All Providers

If you only have some providers configured:

```bash
# Only Groq configured:
# - SIMPLE tier → Groq ✅
# - MEDIUM tier → Groq ✅ (fallback)
# - COMPLEX tier → ERROR ❌
# - REASONING tier → ERROR ❌

# Groq + Google configured:
# - SIMPLE tier → Groq ✅
# - MEDIUM tier → Google ✅
# - COMPLEX tier → ERROR ❌
# - REASONING tier → ERROR ❌

# Groq + Google + Anthropic configured:
# - SIMPLE tier → Groq ✅
# - MEDIUM tier → Google ✅
# - COMPLEX tier → Anthropic ✅
# - REASONING tier → Groq ✅
```

**Recommendation:** Start with Groq + Google (free), add Anthropic when you need complex tasks.

## Common Issues

### "No API keys configured"
- Make sure you exported environment variables OR added to config.yaml
- Reload your shell: `source ~/.bashrc`
- Check: `echo $GROQ_API_KEY` (should show your key)

### "Provider anthropic not configured"
- Router tried to use Anthropic but you don't have the key
- Solution 1: Add ANTHROPIC_API_KEY
- Solution 2: Force a tier that uses a provider you have:
  ```bash
  openclaw config set model smart-router/simple  # Uses Groq
  ```

### Plugin not found
- Make sure you ran `npm link` from plugin directory
- Use full absolute path: `openclaw plugin install /full/path/...`

### Build errors
- Check Node.js version: `node --version` (should be 18+)
- Clean and rebuild:
  ```bash
  npm run clean
  rm -rf node_modules
  npm install
  npm run build
  ```

## Next Steps

1. **Try different prompts** and watch routing decisions
2. **Check costs**: `openclaw router-stats`
3. **Experiment with tiers**:
   ```bash
   openclaw config set model smart-router/simple   # Force cheap
   openclaw config set model smart-router/complex  # Force quality
   openclaw config set model smart-router/auto     # Smart routing
   ```

4. **Use with Continue.dev** for coding (see README.md)

## Getting Help

If you're stuck:
1. Check logs: OpenClaw usually prints helpful error messages
2. Verify API keys work: Try them directly in provider console
3. Check provider status pages
4. Open an issue on GitHub

Happy routing! 🚀
