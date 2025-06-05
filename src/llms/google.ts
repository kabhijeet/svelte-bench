import {
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_SYSTEM_PROMPT_WITH_CONTEXT,
} from "../utils/prompt";
import type { LLMProvider } from "./index";
import { GoogleGenAI } from "@google/genai";

export class GoogleGenAIProvider implements LLMProvider {
  private client: GoogleGenAI;
  private modelId: string;
  name = "Google";
  private readonly availableModels = [
    "gemini-2.5-pro-preview-06-05", // newest model
    "gemini-2.5-pro-preview-05-06",
    "gemini-2.5-pro-preview-03-25",
    "gemini-2.5-flash-preview-04-17",
  ];

  constructor(modelId?: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    this.client = new GoogleGenAI({ apiKey });
    this.modelId = modelId || this.availableModels[0];
  }

  /**
   * Generate code from a prompt using Google Gemini
   * @param prompt The prompt to send to the LLM
   * @param temperature Optional temperature parameter for controlling randomness (default: 0.7)
   * @param contextContent Optional context content to include in prompts
   * @returns The generated code
   */
  async generateCode(
    prompt: string,
    temperature: number = 0.7,
    contextContent?: string
  ): Promise<string> {
    try {
      console.log(
        `🤖 Generating code with Google Gemini using model: ${this.modelId} (temp: ${temperature})...`
      );

      const systemPrompt = contextContent
        ? DEFAULT_SYSTEM_PROMPT_WITH_CONTEXT
        : DEFAULT_SYSTEM_PROMPT;

      const promptWithContext = contextContent
        ? `${systemPrompt}\n\n${contextContent}\n\n${prompt}`
        : `${systemPrompt}\n\n${prompt}`;

      const response = await this.client.models.generateContent({
        model: this.modelId,
        contents: promptWithContext,
        config: {
          temperature: temperature,
        },
      });

      return response.text;
    } catch (error) {
      console.error("Error generating code with Google Gemini:", error);
      throw new Error(
        `Failed to generate code: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get all available models for this provider
   * @returns Array of model identifiers
   */
  getModels(): string[] {
    return [...this.availableModels];
  }

  /**
   * Get the model identifier that was used for generation
   * @returns The model identifier string
   */
  getModelIdentifier(): string {
    return this.modelId;
  }
}
