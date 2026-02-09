import { routeRequest, explainRouting } from './src/router';
import { Message } from './src/types';

// Test cases
const testCases: Array<{ prompt: string; expectedTier?: string }> = [
  {
    prompt: "What is 2+2?",
    expectedTier: "SIMPLE",
  },
  {
    prompt: "Define machine learning",
    expectedTier: "SIMPLE",
  },
  {
    prompt: "Build me a React todo application with TypeScript, state management, and API integration",
    expectedTier: "COMPLEX",
  },
  {
    prompt: "Prove that the square root of 2 is irrational using proof by contradiction",
    expectedTier: "REASONING",
  },
  {
    prompt: "Write a function to reverse a string",
    expectedTier: "MEDIUM",
  },
  {
    prompt: "Explain how kubernetes works",
    expectedTier: "MEDIUM",
  },
  {
    prompt: "Create a distributed system architecture for handling 1M requests per second",
    expectedTier: "COMPLEX",
  },
  {
    prompt: "What's the weather like?",
    expectedTier: "SIMPLE",
  },
];

console.log("🧪 Testing Smart Router\n");
console.log("=".repeat(80));

testCases.forEach((testCase, index) => {
  const messages: Message[] = [
    { role: 'user', content: testCase.prompt }
  ];

  const decision = routeRequest(messages);
  
  const match = !testCase.expectedTier || decision.tier === testCase.expectedTier;
  const emoji = match ? "✅" : "❌";
  
  console.log(`\nTest ${index + 1}: ${emoji}`);
  console.log(`Prompt: "${testCase.prompt}"`);
  console.log(`Expected: ${testCase.expectedTier || "any"}`);
  console.log(`Got: ${decision.tier}`);
  console.log(`Model: ${decision.model.name}`);
  console.log(`Confidence: ${(decision.confidence * 100).toFixed(0)}%`);
  console.log(`Reasoning: ${decision.reasoning}`);
  console.log("-".repeat(80));
});

console.log("\n✅ Router test complete!");
