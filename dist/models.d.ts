import { ModelConfig, Tier } from './types';
export declare const MODELS: ModelConfig[];
export declare const PRIMARY_MODELS: Record<string, ModelConfig>;
export declare function getModelById(id: string): ModelConfig | undefined;
export declare function getModelsByTier(tier: Tier): ModelConfig[];
export declare function getCheapestModelForTier(tier: Tier): ModelConfig;
//# sourceMappingURL=models.d.ts.map