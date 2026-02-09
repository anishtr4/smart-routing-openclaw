import { LLMProvider } from './provider';
import { routeRequest, explainRouting } from './router';
import { CostTracker } from './cost-tracker';
import { PluginConfig, Message, Tier } from './types';
import { MODELS, getCheapestModelForTier } from './models';

export function activate(openclaw: any, config: PluginConfig = {}) {
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
    { id: 'auto', name: '🎯 Auto (Smart Routing)' },
    { id: 'smart-llm-router/auto', name: '🎯 Auto (Smart Routing) - Full ID (Explicit)', contextWindow: 128000, provider: 'smart-llm-router', local: true },
    { id: 'simple', name: '💰 Simple Tier (Cheapest)', contextWindow: 128000, provider: 'smart-llm-router', local: true },
    ...MODELS.map(m => ({
      ...m,
      provider: 'smart-llm-router',
      local: true, // Mark all mapped models as local too
      name: `${m.name} ($${m.inputCostPerMillion}/$${m.outputCostPerMillion})`,
    })),
  ];

  // Main completion function
  const complete = async (messages: Message[], requestModelId?: string) => {
    console.log(`DEBUG: Complete called with requestModelId: "${requestModelId}"`);
    let selectedModel;
    let decision;

    // Determine model ID from request or default
    let modelId = requestModelId || 'auto';

    // Strip provider prefix if present
    if (modelId.includes('/')) {
      modelId = modelId.split('/').pop() || 'auto';
    }

    // Fallback: Check system message for model override (CLI/Testing)
    if (modelId === 'auto' && messages[0]?.role === 'system' && messages[0]?.content.startsWith('model:')) {
      modelId = messages[0].content.replace('model:', '').trim();
    }
    console.log(`DEBUG: Processed modelId: "${modelId}"`);

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

  // Register provider with OpenClaw
  console.log('🔌 Registering provider with models:', JSON.stringify(availableModels, null, 2));

  openclaw.registerProvider({
    id: 'smart-llm-router',
    name: 'Smart Router',
    // Mark as local to bypass auth checks:
    local: true,
    models: availableModels,
    complete,
  });
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
  console.log('   openclaw config set model smart-router/auto');
  console.log('   openclaw chat "Your prompt here"\n');
  console.log('💡 Commands:');
  console.log('   openclaw router-stats    # View cost statistics');
  console.log('   openclaw router-models   # List all models');
  console.log('   openclaw router-reset    # Reset statistics\n');
}

// Alias for backward compatibility or alternate naming convention
export const register = activate;
