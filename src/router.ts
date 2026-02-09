import { RoutingDecision, Tier, Message } from './types';
import { getCheapestModelForTier, MODELS } from './models';

interface RoutingWeights {
  reasoningMarkers: number;
  codePresence: number;
  simpleIndicators: number;
  multiStepPatterns: number;
  technicalTerms: number;
  tokenCount: number;
  creativeMarkers: number;
  questionComplexity: number;
  constraintCount: number;
  imperativeVerbs: number;
  outputFormat: number;
  domainSpecificity: number;
}

const DEFAULT_WEIGHTS: RoutingWeights = {
  reasoningMarkers: 0.18,
  codePresence: 0.15,
  simpleIndicators: 0.12,
  multiStepPatterns: 0.12,
  technicalTerms: 0.10,
  tokenCount: 0.08,
  creativeMarkers: 0.05,
  questionComplexity: 0.05,
  constraintCount: 0.04,
  imperativeVerbs: 0.03,
  outputFormat: 0.03,
  domainSpecificity: 0.02,
};

const REASONING_KEYWORDS = [
  'prove', 'theorem', 'proof', 'step by step', 'reasoning',
  'derive', 'demonstrate', 'verify', 'validate', 'formal',
  'mathematical induction', 'contradiction', 'lemma',
];

const CODE_KEYWORDS = [
  'function', 'class', 'async', 'await', 'import', 'export',
  'const', 'let', 'var', 'return', '```', 'component',
  'method', 'algorithm', 'implementation',
];

const SIMPLE_INDICATORS = [
  'what is', 'define', 'translate', 'summarize', 'list',
  'who is', 'when did', 'where is', 'how many',
];

const MULTI_STEP_PATTERNS = [
  'first', 'then', 'next', 'finally', 'step 1', 'step 2',
  'process', 'workflow', 'procedure', 'sequence',
];

const TECHNICAL_TERMS = [
  'algorithm', 'kubernetes', 'distributed', 'architecture',
  'optimization', 'performance', 'scalability', 'latency',
  'database', 'api', 'microservices', 'blockchain',
];

const CREATIVE_MARKERS = [
  'story', 'poem', 'creative', 'imagine', 'brainstorm',
  'ideas', 'innovative', 'unique', 'original',
];

const IMPERATIVE_VERBS = [
  'build', 'create', 'implement', 'develop', 'design',
  'refactor', 'optimize', 'debug', 'fix', 'improve',
];

function countMatches(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.filter(kw => lowerText.includes(kw)).length;
}

function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function routeRequest(
  messages: Message[],
  defaultTier: Tier = 'MEDIUM'
): RoutingDecision {
  const lastMessage = messages[messages.length - 1];
  const prompt = lastMessage.content;
  
  // Quick rule-based routing for high-confidence cases
  const reasoningCount = countMatches(prompt, REASONING_KEYWORDS);
  if (reasoningCount >= 2) {
    const model = getCheapestModelForTier('REASONING');
    return {
      model,
      tier: 'REASONING',
      confidence: 0.97,
      method: 'rules',
      reasoning: `Detected ${reasoningCount} reasoning markers - requires deep logical thinking`,
    };
  }
  
  // Calculate weighted scores
  const scores = {
    reasoning: countMatches(prompt, REASONING_KEYWORDS) * DEFAULT_WEIGHTS.reasoningMarkers,
    code: countMatches(prompt, CODE_KEYWORDS) * DEFAULT_WEIGHTS.codePresence,
    simple: countMatches(prompt, SIMPLE_INDICATORS) * DEFAULT_WEIGHTS.simpleIndicators,
    multiStep: countMatches(prompt, MULTI_STEP_PATTERNS) * DEFAULT_WEIGHTS.multiStepPatterns,
    technical: countMatches(prompt, TECHNICAL_TERMS) * DEFAULT_WEIGHTS.technicalTerms,
    creative: countMatches(prompt, CREATIVE_MARKERS) * DEFAULT_WEIGHTS.creativeMarkers,
    imperative: countMatches(prompt, IMPERATIVE_VERBS) * DEFAULT_WEIGHTS.imperativeVerbs,
  };
  
  // Token-based scoring
  const tokens = estimateTokens(prompt);
  let tokenScore = 0;
  if (tokens < 50) tokenScore = -DEFAULT_WEIGHTS.tokenCount; // Very short = likely simple
  else if (tokens > 500) tokenScore = DEFAULT_WEIGHTS.tokenCount; // Very long = likely complex
  
  // Question complexity
  const questionMarks = (prompt.match(/\?/g) || []).length;
  const questionScore = questionMarks > 1 ? DEFAULT_WEIGHTS.questionComplexity : 0;
  
  // Constraint detection
  const constraints = countMatches(prompt, ['at most', 'at least', 'maximum', 'minimum', 'O(n)', 'Big O']);
  const constraintScore = constraints * DEFAULT_WEIGHTS.constraintCount;
  
  // Output format detection
  const formatKeywords = ['json', 'yaml', 'xml', 'csv', 'schema', 'format'];
  const formatScore = countMatches(prompt, formatKeywords) * DEFAULT_WEIGHTS.outputFormat;
  
  // Calculate total weighted score
  const totalScore = 
    scores.reasoning + 
    scores.code + 
    scores.multiStep + 
    scores.technical + 
    scores.creative +
    scores.imperative +
    tokenScore +
    questionScore +
    constraintScore +
    formatScore -
    scores.simple; // Subtract simple indicators
  
  // Apply sigmoid for calibration
  const confidence = sigmoid(totalScore * 2);
  
  // Determine tier based on score
  let tier: Tier;
  let reasoning: string;
  
  if (totalScore > 0.3) {
    tier = 'COMPLEX';
    reasoning = 'High complexity detected: technical terms, multi-step reasoning, or code';
  } else if (totalScore > 0.15) {
    tier = 'MEDIUM';
    reasoning = 'Moderate complexity: balanced task requiring decent capability';
  } else if (scores.simple > 0 || tokens < 50) {
    tier = 'SIMPLE';
    reasoning = 'Simple task: basic question or short prompt';
  } else {
    tier = defaultTier;
    reasoning = `Ambiguous complexity - defaulting to ${defaultTier} tier`;
  }
  
  // Get the cheapest model for the selected tier
  const model = getCheapestModelForTier(tier);
  
  return {
    model,
    tier,
    confidence,
    method: confidence > 0.8 ? 'heuristics' : 'fallback',
    reasoning,
  };
}

export function explainRouting(decision: RoutingDecision): string {
  const savingsVsOpus = ((1 - (decision.model.inputCostPerMillion + decision.model.outputCostPerMillion) / 180) * 100).toFixed(0);
  
  return [
    `🎯 Routing Decision:`,
    `   Model: ${decision.model.name}`,
    `   Tier: ${decision.tier}`,
    `   Confidence: ${(decision.confidence * 100).toFixed(0)}%`,
    `   Method: ${decision.method}`,
    `   Reason: ${decision.reasoning}`,
    `   Cost: $${decision.model.inputCostPerMillion.toFixed(2)}/$${decision.model.outputCostPerMillion.toFixed(2)} per 1M tokens`,
    `   Savings vs Opus: ~${savingsVsOpus}%`,
  ].join('\n');
}
