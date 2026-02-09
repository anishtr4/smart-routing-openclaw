import { createServer } from 'node:http';
import { LLMProvider } from './provider';
import { routeRequest, explainRouting } from './router';
import { CostTracker } from './cost-tracker';
import { PluginConfig, Message, Tier } from './types';
import { MODELS, getCheapestModelForTier } from './models';

export function register(api: any) {
  const openclaw = api;
  const config = api.pluginConfig || {};
  console.log('🚀 Smart LLM Router initializing...');
  console.log('📥 Received Config:', JSON.stringify(config, null, 2));

  // Get API keys from config or environment
  const anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
  const googleKey = config.googleApiKey || process.env.GOOGLE_API_KEY;
  const groqKey = config.groqApiKey || process.env.GROQ_API_KEY;
  const openaiKey = config.openaiApiKey || process.env.OPENAI_API_KEY;

  // Validate at least one provider is configured
  if (!anthropicKey && !googleKey && !groqKey && !openaiKey) {
    console.warn(
      '⚠️ Smart Router: No API keys configured! functionality will be limited.\n' +
      '  Please set GOOGLE_API_KEY, OPENAI_API_KEY, etc.'
    );
  }

  // Initialize provider
  const provider = new LLMProvider({
    anthropicKey,
    googleKey,
    groqKey,
    openaiKey,
  });

  // Initialize cost tracker
  const costTracker = config.costTracking !== false
    ? new CostTracker()
    : null;

  // Log configured providers
  const configuredProviders = [
    anthropicKey && 'Anthropic',
    googleKey && 'Google',
    groqKey && 'Groq',
    openaiKey && 'OpenAI',
  ].filter(Boolean);

  console.log(`✅ Configured providers: ${configuredProviders.join(', ')}`);

  if (costTracker) {
    console.log('📊 Cost tracking enabled');
  }

  // Register models with OpenClaw
  const availableModels = [
    {
      id: 'auto',
      name: '🎯 Auto (Smart Routing)',
      api: 'openai-completions',
      reasoning: true,
      input: ["text", "image"] as ("text" | "image")[],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000,
      maxTokens: 4096,
    },
    ...MODELS.map(m => ({
      id: m.id,
      name: `${m.name} [${m.tier}]`,
      api: 'openai-completions',
      reasoning: m.reasoning || false,
      input: (m.input || ["text"]) as ("text" | "image")[],
      cost: {
        input: m.inputCostPerMillion,
        output: m.outputCostPerMillion,
        cacheRead: 0,
        cacheWrite: 0
      },
      contextWindow: m.contextWindow,
      maxTokens: m.maxTokens || 4096,
    })),
  ];

  // Main completion function
  const complete = async (messages: Message[], requestModelId?: string) => {
    console.log(`DEBUG: Complete called with requestModelId: "${requestModelId}"`);
    let selectedModel;
    let decision;

    // Determine model ID from request or default
    let modelId = requestModelId || 'auto';
    const originalId = modelId;

    // Strip provider prefix IF it matches our provider ID
    if (modelId.startsWith('smart-router/')) {
      modelId = modelId.replace('smart-router/', '');
    } else if (modelId.includes('/')) {
      // If it's another provider's model, we can't handle it unless it's a known model ID
      const parts = modelId.split('/');
      modelId = parts[parts.length - 1];
    }

    console.log(`DEBUG: Routing request for model: "${modelId}" (Original: "${originalId}")`);

    // Handle tier selection
    if (modelId === 'auto') {
      decision = routeRequest(messages, (config.defaultTier as Tier) || 'MEDIUM');
      selectedModel = decision.model;

      if (config.enableLogging !== false) {
        console.log('\n' + explainRouting(decision));
      }
    } else if (['simple', 'medium', 'complex', 'reasoning'].includes(modelId)) {
      const tier = modelId.toUpperCase() as Tier;
      selectedModel = getCheapestModelForTier(tier);

      if (config.enableLogging !== false) {
        console.log(`\n🎯 Using ${tier} tier: ${selectedModel.name}`);
      }
    } else {
      // Specific model requested
      selectedModel = MODELS.find(m => m.id === modelId);
      if (!selectedModel) {
        throw new Error(`Unknown model: ${modelId}`);
      }

      if (config.enableLogging !== false) {
        console.log(`\n🎯 Using specific model: ${selectedModel.name}`);
      }
    }

    // Check if provider is available
    if (!provider.hasProvider(selectedModel.provider)) {
      throw new Error(
        `Provider ${selectedModel.provider} not configured. ` +
        `Please set ${selectedModel.provider.toUpperCase()}_API_KEY.`
      );
    }

    // Call the model
    const startTime = Date.now();
    const response = await provider.complete(messages, selectedModel);
    const duration = Date.now() - startTime;

    // Track cost
    if (costTracker) {
      costTracker.trackRequest(
        selectedModel.tier,
        selectedModel.provider,
        response.usage.input_tokens,
        response.usage.output_tokens,
        selectedModel.inputCostPerMillion,
        selectedModel.outputCostPerMillion
      );
    }

    // Log completion
    if (config.enableLogging !== false) {
      console.log([
        `✅ Completed in ${duration}ms`,
        `   Tokens: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`,
        `   Cost: $${response.usage.cost.toFixed(6)}`,
      ].join('\n'));
    }

    return response;
  };

  // 1. Register provider for runtime functionality
  openclaw.registerProvider({
    id: 'smart-router',
    name: 'Smart Router',
    api: 'smart-router',
    baseUrl: 'http://localhost/smart-router',
    apiKey: 'local', // Satisfies registry auth check
    models: availableModels,
    complete,
    // Provide streamSimple for newer pi-ai compatibility
    streamSimple: async function* (model: any, context: any) {
      const response = await complete(context.messages, model.id);
      yield {
        text: response.content,
        usage: response.usage,
        finishReason: 'stop'
      };
    }
  });

  // 2. The "Real Bridge" Server (Internal HTTP listener)
  // OpenClaw's 'openai-completions' driver makes actual network requests.
  // We start a tiny local server to catch these and pipe them to our logic.
  const server = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url?.startsWith('/v1/chat/completions')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const modelId = data.model || 'auto';
          const response = await complete(data.messages, modelId);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: modelId,
            choices: [{
              index: 0,
              message: { role: 'assistant', content: response.content },
              finish_reason: 'stop'
            }],
            usage: response.usage
          }));
        } catch (err: any) {
          console.error('❌ Bridge Error:', err.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  // Handle "Port In Use" smoothly to prevent crashes on reload
  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.log('⚠️  Internal HTTP Bridge already running on port 8511 (skipping startup)');
    } else {
      console.error('❌ Bridge Error:', e);
    }
  });

  // Listen on a local-only port
  server.listen(8511, '127.0.0.1', () => {
    console.log('🚀 Internal HTTP Bridge listening on 127.0.0.1:8511');
  });

  // 3. Direct Registry Injection (The "Magic Bridge" for the CLI)
  // Ensures 'openclaw models list' sees your models immediately
  if (api.config) {
    if (!api.config.models) api.config.models = {};
    if (!api.config.models.providers) api.config.models.providers = {};

    console.log('🏗️  Targeting OpenClaw Model Registry...');
    api.config.models.providers['smart-router'] = {
      baseUrl: 'http://127.0.0.1:8511/v1', // Point directly to our internal bridge
      api: 'openai-completions',
      apiKey: 'local',
      models: availableModels
    };
    console.log('✅ Registry Injection successful!');
  }
  console.log('✅ Provider registered!');

  // Register CLI commands
  openclaw.registerCommand({
    name: 'router-stats',
    description: 'Show routing statistics and costs',
    handler: () => {
      if (costTracker) {
        console.log('\n' + costTracker.getSummary());
      } else {
        console.log('Cost tracking is disabled');
      }
    },
  });

  openclaw.registerCommand({
    name: 'router-reset',
    description: 'Reset routing statistics',
    handler: () => {
      if (costTracker) {
        costTracker.reset();
        console.log('✅ Statistics reset');
      } else {
        console.log('Cost tracking is disabled');
      }
    },
  });

  openclaw.registerCommand({
    name: 'router-models',
    description: 'List all available models with pricing',
    handler: () => {
      console.log('\n📋 Available Models:\n');

      const byTier: Record<Tier, typeof MODELS> = {
        SIMPLE: [],
        MEDIUM: [],
        COMPLEX: [],
        REASONING: [],
      };

      MODELS.forEach(m => byTier[m.tier].push(m));

      Object.entries(byTier).forEach(([tier, models]) => {
        console.log(`\n${tier}:`);
        models.forEach(m => {
          const available = provider.hasProvider(m.provider) ? '✅' : '❌';
          console.log([
            `  ${available} ${m.name}`,
            `     ID: ${m.id}`,
            `     Cost: $${m.inputCostPerMillion.toFixed(2)}/$${m.outputCostPerMillion.toFixed(2)} per 1M tokens`,
            `     Context: ${m.contextWindow.toLocaleString()} tokens`,
          ].join('\n'));
        });
      });
    },
  });

  console.log('✅ Smart LLM Router ready!\n');
  console.log('💡 Usage:');
  console.log('   openclaw config set agents.defaults.model.primary smart-router/auto');
  console.log('   openclaw chat "Your prompt here"\n');
  console.log('💡 Commands:');
  console.log('   openclaw router-stats    # View cost statistics');
  console.log('   openclaw router-models   # List all models');
  console.log('   openclaw router-reset    # Reset statistics\n');
}

// Alias for backward compatibility or alternate naming convention
export { register as activate };
