"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
exports.activate = activate;
const provider_1 = require("./provider");
const router_1 = require("./router");
const cost_tracker_1 = require("./cost-tracker");
const models_1 = require("./models");
async function activate(openclaw, config) {
    console.log('🚀 Smart LLM Router initializing...');
    // Get API keys from config or environment
    const anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    const googleKey = config.googleApiKey || process.env.GOOGLE_API_KEY;
    const groqKey = config.groqApiKey || process.env.GROQ_API_KEY;
    const openaiKey = config.openaiApiKey || process.env.OPENAI_API_KEY;
    // Validate at least one provider is configured
    if (!anthropicKey && !googleKey && !groqKey && !openaiKey) {
        throw new Error('No API keys configured! Please set at least one of:\n' +
            '  - ANTHROPIC_API_KEY\n' +
            '  - GOOGLE_API_KEY\n' +
            '  - GROQ_API_KEY\n' +
            '  - OPENAI_API_KEY\n' +
            'Or configure them in plugin settings.');
    }
    // Initialize provider
    const provider = new provider_1.LLMProvider({
        anthropicKey,
        googleKey,
        groqKey,
        openaiKey,
    });
    // Initialize cost tracker
    const costTracker = config.costTracking !== false
        ? new cost_tracker_1.CostTracker()
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
        { id: 'simple', name: '💰 Simple Tier (Cheapest)' },
        { id: 'medium', name: '⚖️ Medium Tier (Balanced)' },
        { id: 'complex', name: '🎓 Complex Tier (High Quality)' },
        { id: 'reasoning', name: '🧠 Reasoning Tier (Maximum Capability)' },
        ...models_1.MODELS.map(m => ({
            id: m.id,
            name: `${m.name} ($${m.inputCostPerMillion}/$${m.outputCostPerMillion})`,
        })),
    ];
    // Main completion function
    const complete = async (messages) => {
        let selectedModel;
        let decision;
        const modelId = messages[0]?.role === 'system' && messages[0]?.content.startsWith('model:')
            ? messages[0].content.replace('model:', '').trim()
            : 'auto';
        // Handle tier selection
        if (modelId === 'auto') {
            decision = (0, router_1.routeRequest)(messages, config.defaultTier || 'MEDIUM');
            selectedModel = decision.model;
            if (config.enableLogging !== false) {
                console.log('\n' + (0, router_1.explainRouting)(decision));
            }
        }
        else if (['simple', 'medium', 'complex', 'reasoning'].includes(modelId)) {
            const tier = modelId.toUpperCase();
            selectedModel = (0, models_1.getCheapestModelForTier)(tier);
            if (config.enableLogging !== false) {
                console.log(`\n🎯 Using ${tier} tier: ${selectedModel.name}`);
            }
        }
        else {
            // Specific model requested
            selectedModel = models_1.MODELS.find(m => m.id === modelId);
            if (!selectedModel) {
                throw new Error(`Unknown model: ${modelId}`);
            }
            if (config.enableLogging !== false) {
                console.log(`\n🎯 Using specific model: ${selectedModel.name}`);
            }
        }
        // Check if provider is available
        if (!provider.hasProvider(selectedModel.provider)) {
            throw new Error(`Provider ${selectedModel.provider} not configured. ` +
                `Please set ${selectedModel.provider.toUpperCase()}_API_KEY.`);
        }
        // Call the model
        const startTime = Date.now();
        const response = await provider.complete(messages, selectedModel);
        const duration = Date.now() - startTime;
        // Track cost
        if (costTracker) {
            costTracker.trackRequest(selectedModel.tier, selectedModel.provider, response.usage.input_tokens, response.usage.output_tokens, selectedModel.inputCostPerMillion, selectedModel.outputCostPerMillion);
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
    openclaw.registerProvider({
        id: 'smart-router',
        name: 'Smart Router',
        models: availableModels,
        complete,
    });
    // Register CLI commands
    openclaw.registerCommand({
        name: 'router-stats',
        description: 'Show routing statistics and costs',
        handler: () => {
            if (costTracker) {
                console.log('\n' + costTracker.getSummary());
            }
            else {
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
            }
            else {
                console.log('Cost tracking is disabled');
            }
        },
    });
    openclaw.registerCommand({
        name: 'router-models',
        description: 'List all available models with pricing',
        handler: () => {
            console.log('\n📋 Available Models:\n');
            const byTier = {
                SIMPLE: [],
                MEDIUM: [],
                COMPLEX: [],
                REASONING: [],
            };
            models_1.MODELS.forEach(m => byTier[m.tier].push(m));
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
exports.register = activate;
//# sourceMappingURL=index.js.map