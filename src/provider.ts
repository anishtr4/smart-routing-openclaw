import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { Message, CompletionResponse, ModelConfig } from './types';

export class LLMProvider {
  private anthropic?: Anthropic;
  private google?: GoogleGenerativeAI;
  private groq?: Groq;
  private openai?: OpenAI;

  constructor(config: {
    anthropicKey?: string;
    googleKey?: string;
    groqKey?: string;
    openaiKey?: string;
  }) {
    if (config.anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: config.anthropicKey });
    }
    if (config.googleKey) {
      this.google = new GoogleGenerativeAI(config.googleKey);
    }
    if (config.groqKey) {
      this.groq = new Groq({ apiKey: config.groqKey });
    }
    if (config.openaiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiKey });
    }
  }

  async complete(
    messages: Message[],
    model: ModelConfig
  ): Promise<CompletionResponse> {
    switch (model.provider) {
      case 'anthropic':
        return await this.completeAnthropic(messages, model);
      case 'google':
        return await this.completeGoogle(messages, model);
      case 'groq':
        return await this.completeGroq(messages, model);
      case 'openai':
        return await this.completeOpenAI(messages, model);
      default:
        throw new Error(`Unknown provider: ${model.provider}`);
    }
  }

  private async completeAnthropic(
    messages: Message[],
    model: ModelConfig
  ): Promise<CompletionResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY or configure in plugin settings.');
    }

    const response = await this.anthropic.messages.create({
      model: model.id,
      max_tokens: 4096,
      messages: messages.map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
    });

    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    const cost = 
      (response.usage.input_tokens / 1_000_000) * model.inputCostPerMillion +
      (response.usage.output_tokens / 1_000_000) * model.outputCostPerMillion;

    return {
      content,
      model: model.id,
      tier: model.tier,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cost,
      },
    };
  }

  private async completeGoogle(
    messages: Message[],
    model: ModelConfig
  ): Promise<CompletionResponse> {
    if (!this.google) {
      throw new Error('Google API key not configured. Set GOOGLE_API_KEY or configure in plugin settings.');
    }

    const genModel = this.google.getGenerativeModel({ model: model.id });
    
    // Convert messages to Google format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    const result = await genModel.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    // Google doesn't provide token counts easily, estimate
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    
    const cost = 
      (inputTokens / 1_000_000) * model.inputCostPerMillion +
      (outputTokens / 1_000_000) * model.outputCostPerMillion;

    return {
      content,
      model: model.id,
      tier: model.tier,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost,
      },
    };
  }

  private async completeGroq(
    messages: Message[],
    model: ModelConfig
  ): Promise<CompletionResponse> {
    if (!this.groq) {
      throw new Error('Groq API key not configured. Set GROQ_API_KEY or configure in plugin settings.');
    }

    const response = await this.groq.chat.completions.create({
      model: model.id,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    const cost = 
      (inputTokens / 1_000_000) * model.inputCostPerMillion +
      (outputTokens / 1_000_000) * model.outputCostPerMillion;

    return {
      content,
      model: model.id,
      tier: model.tier,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost,
      },
    };
  }

  private async completeOpenAI(
    messages: Message[],
    model: ModelConfig
  ): Promise<CompletionResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY or configure in plugin settings.');
    }

    const response = await this.openai.chat.completions.create({
      model: model.id,
      messages: messages.map(m => ({
        role: m.role === 'system' ? 'system' : m.role,
        content: m.content,
      })),
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    const cost = 
      (inputTokens / 1_000_000) * model.inputCostPerMillion +
      (outputTokens / 1_000_000) * model.outputCostPerMillion;

    return {
      content,
      model: model.id,
      tier: model.tier,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost,
      },
    };
  }

  hasProvider(provider: 'anthropic' | 'google' | 'groq' | 'openai'): boolean {
    switch (provider) {
      case 'anthropic': return !!this.anthropic;
      case 'google': return !!this.google;
      case 'groq': return !!this.groq;
      case 'openai': return !!this.openai;
    }
  }
}
