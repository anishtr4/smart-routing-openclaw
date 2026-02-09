export type Tier = 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING';
export type Provider = 'anthropic' | 'google' | 'groq' | 'openai';
export interface ModelConfig {
    id: string;
    name: string;
    provider: Provider;
    inputCostPerMillion: number;
    outputCostPerMillion: number;
    contextWindow: number;
    tier: Tier;
}
export interface RoutingDecision {
    model: ModelConfig;
    tier: Tier;
    confidence: number;
    method: 'rules' | 'heuristics' | 'fallback';
    reasoning: string;
}
export interface PluginConfig {
    anthropicApiKey?: string;
    googleApiKey?: string;
    groqApiKey?: string;
    openaiApiKey?: string;
    defaultTier?: Tier;
    enableLogging?: boolean;
    costTracking?: boolean;
}
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface CompletionResponse {
    content: string;
    model: string;
    tier: Tier;
    usage: {
        input_tokens: number;
        output_tokens: number;
        cost: number;
    };
}
export interface CostStats {
    totalRequests: number;
    totalCost: number;
    costByTier: Record<Tier, number>;
    costByProvider: Record<Provider, number>;
    tokensByTier: Record<Tier, {
        input: number;
        output: number;
    }>;
}
//# sourceMappingURL=types.d.ts.map