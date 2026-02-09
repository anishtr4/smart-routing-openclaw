import { Message, CompletionResponse, ModelConfig } from './types';
export declare class LLMProvider {
    private anthropic?;
    private google?;
    private groq?;
    private openai?;
    constructor(config: {
        anthropicKey?: string;
        googleKey?: string;
        groqKey?: string;
        openaiKey?: string;
    });
    complete(messages: Message[], model: ModelConfig): Promise<CompletionResponse>;
    private completeAnthropic;
    private completeGoogle;
    private completeGroq;
    private completeOpenAI;
    hasProvider(provider: 'anthropic' | 'google' | 'groq' | 'openai'): boolean;
}
//# sourceMappingURL=provider.d.ts.map