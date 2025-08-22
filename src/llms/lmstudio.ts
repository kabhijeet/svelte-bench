import {
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_SYSTEM_PROMPT_WITH_CONTEXT,
} from "../utils/prompt";
import type { LLMProvider } from "./index";
import { LMStudioClient } from "@lmstudio/sdk";

/**
 * LM Studio provider (local models via LM Studio desktop / server)
 * Assumes LM Studio is running locally and accessible via its default endpoint.
 * Environment variables:
 *  - LMSTUDIO_MODEL (optional) default model id override
 */
export class LMStudioProvider implements LLMProvider {
  private client: LMStudioClient;
  private modelId: string;
  name = "LMStudio";

  // Provide a small curated list of common local instruct models; user can override via model argument
  private readonly availableModels: string[] = [
    // Lightweight examples – users expected to have pulled one of these
    "qwen/qwen3-4b-thinking-2507"
  ];

  constructor(modelId?: string) {
    // Instantiate client with default configuration (auto-connect to local LM Studio)
    this.client = new LMStudioClient();
    // Allow env override, then explicit constructor param, then fallback list
    this.modelId = modelId || process.env.LMSTUDIO_MODEL || this.availableModels[0];
  }

  async generateCode(
    prompt: string,
    temperature?: number,
    contextContent?: string,
  ): Promise<string> {
    try {
      console.log(
        `🤖 Generating code with LMStudio using model: ${this.modelId} (temp: ${
          temperature ?? "default"
        })...`,
      );

      const systemPrompt = contextContent
        ? DEFAULT_SYSTEM_PROMPT_WITH_CONTEXT
        : DEFAULT_SYSTEM_PROMPT;

      const fullPromptParts: string[] = [systemPrompt];
      if (contextContent) {
        fullPromptParts.push("\n<!-- CONTEXT START -->\n" + contextContent + "\n<!-- CONTEXT END -->\n");
      }
      fullPromptParts.push(prompt);
      const combined = fullPromptParts.join("\n\n");

      // Ensure model is loaded (sdk will load on demand; we can still explicitly request)
      const model = await this.client.llm.model(this.modelId);

      const result = await model.respond(combined, {
        temperature: temperature, // undefined -> default
      });

      // result.content can be string or array (per SDK design). Normalize to string.
      const content = Array.isArray(result.content)
        ? result.content
            .map((c: unknown) => {
              if (typeof c === "string") return c;
              if (typeof c === "object" && c !== null) {
                // Attempt to access a text field (SDK may expose structured parts)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (c as any).text ?? "";
              }
              return "";
            })
            .join("")
        : (result.content as string | undefined) ?? "";

      return content;
    } catch (error) {
      console.error("Error generating code with LMStudio:", error);
      throw new Error(
        `Failed to generate code: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  getModels(): string[] {
    return [...this.availableModels];
  }

  getModelIdentifier(): string {
    return this.modelId;
  }
}

export default LMStudioProvider;