import { CostStats, Tier, Provider } from './types';
export declare class CostTracker {
    private stats;
    constructor();
    private loadStats;
    private saveStats;
    trackRequest(tier: Tier, provider: Provider, inputTokens: number, outputTokens: number, inputCostPerMillion: number, outputCostPerMillion: number): number;
    getStats(): CostStats;
    getSummary(): string;
    reset(): void;
}
//# sourceMappingURL=cost-tracker.d.ts.map