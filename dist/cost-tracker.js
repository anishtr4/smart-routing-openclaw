"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostTracker = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const STATS_FILE = path.join(os.homedir(), '.openclaw', 'smart-router-stats.json');
class CostTracker {
    stats;
    constructor() {
        this.stats = this.loadStats();
    }
    loadStats() {
        try {
            if (fs.existsSync(STATS_FILE)) {
                const data = fs.readFileSync(STATS_FILE, 'utf-8');
                return JSON.parse(data);
            }
        }
        catch (error) {
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
    saveStats() {
        try {
            const dir = path.dirname(STATS_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(STATS_FILE, JSON.stringify(this.stats, null, 2));
        }
        catch (error) {
            console.error('Failed to save stats:', error);
        }
    }
    trackRequest(tier, provider, inputTokens, outputTokens, inputCostPerMillion, outputCostPerMillion) {
        const cost = (inputTokens / 1_000_000) * inputCostPerMillion +
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
    getStats() {
        return { ...this.stats };
    }
    getSummary() {
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
        const totalTokens = Object.values(stats.tokensByTier).reduce((sum, t) => sum + t.input + t.output, 0);
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
    reset() {
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
exports.CostTracker = CostTracker;
//# sourceMappingURL=cost-tracker.js.map