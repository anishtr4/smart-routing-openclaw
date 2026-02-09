import { CostStats, Tier, Provider } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const STATS_FILE = path.join(os.homedir(), '.openclaw', 'smart-router-stats.json');

export class CostTracker {
  private stats: CostStats;

  constructor() {
    this.stats = this.loadStats();
  }

  private loadStats(): CostStats {
    try {
      if (fs.existsSync(STATS_FILE)) {
        const data = fs.readFileSync(STATS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load stats, starting fresh');
    }

    return {
      totalRequests: 0,
      totalCost: 0,
      costByTier: {
        SIMPLE: 0,
        MEDIUM: 0,
        COMPLEX: 0,
        REASONING: 0,
      },
      costByProvider: {
        anthropic: 0,
        google: 0,
        groq: 0,
        openai: 0,
      },
      tokensByTier: {
        SIMPLE: { input: 0, output: 0 },
        MEDIUM: { input: 0, output: 0 },
        COMPLEX: { input: 0, output: 0 },
        REASONING: { input: 0, output: 0 },
      },
    };
  }

  private saveStats(): void {
    try {
      const dir = path.dirname(STATS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STATS_FILE, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  trackRequest(
    tier: Tier,
    provider: Provider,
    inputTokens: number,
    outputTokens: number,
    inputCostPerMillion: number,
    outputCostPerMillion: number
  ): number {
    const cost = 
      (inputTokens / 1_000_000) * inputCostPerMillion +
      (outputTokens / 1_000_000) * outputCostPerMillion;

    this.stats.totalRequests++;
    this.stats.totalCost += cost;
    this.stats.costByTier[tier] += cost;
    this.stats.costByProvider[provider] += cost;
    this.stats.tokensByTier[tier].input += inputTokens;
    this.stats.tokensByTier[tier].output += outputTokens;

    this.saveStats();
    
    return cost;
  }

  getStats(): CostStats {
    return { ...this.stats };
  }

  getSummary(): string {
    const stats = this.stats;
    
    const tierBreakdown = Object.entries(stats.costByTier)
      .map(([tier, cost]) => {
        const pct = stats.totalCost > 0 ? ((cost / stats.totalCost) * 100).toFixed(1) : '0.0';
        return `   ${tier.padEnd(10)} $${cost.toFixed(4)} (${pct}%)`;
      })
      .join('\n');

    const providerBreakdown = Object.entries(stats.costByProvider)
      .map(([provider, cost]) => {
        const pct = stats.totalCost > 0 ? ((cost / stats.totalCost) * 100).toFixed(1) : '0.0';
        return `   ${provider.padEnd(10)} $${cost.toFixed(4)} (${pct}%)`;
      })
      .join('\n');

    const totalTokens = Object.values(stats.tokensByTier).reduce(
      (sum, t) => sum + t.input + t.output,
      0
    );

    return [
      '📊 Smart Router Statistics:',
      '',
      `Total Requests: ${stats.totalRequests}`,
      `Total Cost:     $${stats.totalCost.toFixed(4)}`,
      `Total Tokens:   ${totalTokens.toLocaleString()}`,
      `Avg Cost/Req:   $${stats.totalRequests > 0 ? (stats.totalCost / stats.totalRequests).toFixed(4) : '0'}`,
      '',
      'By Tier:',
      tierBreakdown,
      '',
      'By Provider:',
      providerBreakdown,
    ].join('\n');
  }

  reset(): void {
    this.stats = {
      totalRequests: 0,
      totalCost: 0,
      costByTier: {
        SIMPLE: 0,
        MEDIUM: 0,
        COMPLEX: 0,
        REASONING: 0,
      },
      costByProvider: {
        anthropic: 0,
        google: 0,
        groq: 0,
        openai: 0,
      },
      tokensByTier: {
        SIMPLE: { input: 0, output: 0 },
        MEDIUM: { input: 0, output: 0 },
        COMPLEX: { input: 0, output: 0 },
        REASONING: { input: 0, output: 0 },
      },
    };
    this.saveStats();
  }
}
