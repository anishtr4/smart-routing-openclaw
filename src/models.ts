import { ModelConfig, Tier } from './types';

export const MODELS: ModelConfig[] = [
  // SIMPLE TIER - Cheapest, for basic tasks
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B (Groq)',
    provider: 'groq',
    inputCostPerMillion: 0.59,
    outputCostPerMillion: 0.79,
    contextWindow: 128000,
    tier: 'SIMPLE',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    inputCostPerMillion: 0.075,
    outputCostPerMillion: 0.30,
    contextWindow: 1000000,
    tier: 'SIMPLE',
  },
  
  // MEDIUM TIER - Balanced cost/performance
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    inputCostPerMillion: 0.15,
    outputCostPerMillion: 0.60,
    contextWindow: 128000,
    tier: 'MEDIUM',
  },
  {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    inputCostPerMillion: 1.00,
    outputCostPerMillion: 5.00,
    contextWindow: 200000,
    tier: 'MEDIUM',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    inputCostPerMillion: 0.10,
    outputCostPerMillion: 0.40,
    contextWindow: 1000000,
    tier: 'MEDIUM',
  },
  
  // COMPLEX TIER - High quality for difficult tasks
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    inputCostPerMillion: 3.00,
    outputCostPerMillion: 15.00,
    contextWindow: 200000,
    tier: 'COMPLEX',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    inputCostPerMillion: 2.50,
    outputCostPerMillion: 10.00,
    contextWindow: 128000,
    tier: 'COMPLEX',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    inputCostPerMillion: 1.25,
    outputCostPerMillion: 10.00,
    contextWindow: 2000000,
    tier: 'COMPLEX',
  },
  
  // REASONING TIER - Maximum capability for hard problems
  {
    id: 'claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    inputCostPerMillion: 15.00,
    outputCostPerMillion: 75.00,
    contextWindow: 200000,
    tier: 'REASONING',
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'openai',
    inputCostPerMillion: 1.10,
    outputCostPerMillion: 4.40,
    contextWindow: 128000,
    tier: 'REASONING',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'groq',
    inputCostPerMillion: 0.55,
    outputCostPerMillion: 2.19,
    contextWindow: 128000,
    tier: 'REASONING',
  },
];

// Quick lookup by provider and tier
export const PRIMARY_MODELS: Record<string, ModelConfig> = {
  'simple-groq': MODELS.find(m => m.id === 'llama-3.1-70b-versatile')!,
  'simple-google': MODELS.find(m => m.id === 'gemini-1.5-flash')!,
  'medium-google': MODELS.find(m => m.id === 'gemini-2.0-flash')!,
  'medium-openai': MODELS.find(m => m.id === 'gpt-4o-mini')!,
  'medium-anthropic': MODELS.find(m => m.id === 'claude-haiku-4.5')!,
  'complex-anthropic': MODELS.find(m => m.id === 'claude-sonnet-4.5')!,
  'complex-openai': MODELS.find(m => m.id === 'gpt-4o')!,
  'complex-google': MODELS.find(m => m.id === 'gemini-2.5-pro')!,
  'reasoning-anthropic': MODELS.find(m => m.id === 'claude-opus-4.5')!,
  'reasoning-openai': MODELS.find(m => m.id === 'o3-mini')!,
  'reasoning-groq': MODELS.find(m => m.id === 'deepseek-reasoner')!,
};

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find(m => m.id === id);
}

export function getModelsByTier(tier: Tier): ModelConfig[] {
  return MODELS.filter(m => m.tier === tier);
}

export function getCheapestModelForTier(tier: Tier): ModelConfig {
  const models = getModelsByTier(tier);
  return models.reduce((cheapest, current) => {
    const cheapestAvg = (cheapest.inputCostPerMillion + cheapest.outputCostPerMillion) / 2;
    const currentAvg = (current.inputCostPerMillion + current.outputCostPerMillion) / 2;
    return currentAvg < cheapestAvg ? current : cheapest;
  });
}
