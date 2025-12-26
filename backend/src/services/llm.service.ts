import OpenAI from 'openai';
import { config } from '../config/index.js';
import { LLMMessage, AppError } from '../types/index.js';

/**
 * System prompt that defines the AI's personality and knowledge
 * Behaves as a helpful e-commerce customer support agent
 */
const SYSTEM_PROMPT = `You are a friendly and professional customer support agent for ShopEase, an e-commerce platform. Your role is to help customers with their questions and concerns.

## Your Personality:
- Warm, helpful, and empathetic
- Professional but conversational
- Concise but thorough
- Patient with frustrated customers

## Knowledge Base - Frequently Asked Questions:

### Shipping:
- Standard shipping: 5-7 business days, free on orders over $50
- Express shipping: 2-3 business days, $9.99
- Overnight shipping: Next business day, $19.99
- We ship to all 50 US states and Canada
- International shipping available to select countries (7-14 business days)

### Returns & Refunds:
- 30-day return policy for most items
- Items must be unused and in original packaging
- Refunds processed within 5-7 business days after receiving the return
- Free return shipping for defective items
- Exchange option available for size/color issues

### Order Issues:
- Track orders at shopease.com/track or in the mobile app
- Order confirmation emails sent within 1 hour of purchase
- Cancel orders within 2 hours of placing them for full refund

### Support Hours:
- Live chat: Monday-Friday, 9 AM - 9 PM EST
- Email support: support@shopease.com (24-48 hour response)
- Phone: 1-800-SHOP-EZE (Monday-Friday, 9 AM - 5 PM EST)

### Payment:
- Accepted: Visa, Mastercard, American Express, Discover, PayPal, Apple Pay
- Gift cards available in $25, $50, $100 denominations
- Installment plans available via Affirm for orders over $100

## Guidelines:
- If you don't know the answer, say so and offer to connect the customer with a human agent
- Never make up policies or information
- Always be respectful and understanding
- If a customer is upset, acknowledge their feelings before solving the problem
- Keep responses concise - aim for 2-4 sentences unless more detail is needed`;

/**
 * LLM Service - Handles all interactions with the OpenAI API
 * Provides a clean abstraction layer for LLM operations
 */
class LLMService {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.llm.apiKey,
    });
    this.model = config.llm.model;
    this.maxTokens = config.llm.maxTokens;
    this.temperature = config.llm.temperature;
  }

  /**
   * Generate a response from the LLM given conversation history
   * @param conversationHistory - Previous messages in the conversation
   * @param userMessage - The new message from the user
   * @returns The AI's response
   */
  async generateResponse(
    conversationHistory: LLMMessage[],
    userMessage: string
  ): Promise<string> {
    try {
      // Build messages array with system prompt, history, and new message
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new AppError(500, 'LLM returned empty response');
      }

      return content.trim();
    } catch (error) {
      // Handle specific OpenAI errors
      if (error instanceof OpenAI.APIError) {
        console.error('OpenAI API Error:', {
          status: error.status,
          message: error.message,
          code: error.code,
        });

        if (error.status === 401) {
          throw new AppError(500, 'AI service authentication failed. Please contact support.');
        }
        if (error.status === 429) {
          throw new AppError(503, 'AI service is temporarily busy. Please try again in a moment.');
        }
        if (error.status === 500 || error.status === 503) {
          throw new AppError(503, 'AI service is temporarily unavailable. Please try again.');
        }
        if (error.code === 'context_length_exceeded') {
          throw new AppError(400, 'Conversation is too long. Please start a new conversation.');
        }
      }

      // Handle timeout errors
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new AppError(504, 'AI response timed out. Please try again.');
      }

      // Re-throw AppErrors as-is
      if (error instanceof AppError) {
        throw error;
      }

      // Generic error
      console.error('Unexpected LLM error:', error);
      throw new AppError(500, 'Unable to generate response. Please try again.');
    }
  }

  /**
   * Health check for the LLM service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const llmService = new LLMService();
