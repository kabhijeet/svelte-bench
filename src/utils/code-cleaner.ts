/**
 * Cleans markdown code block formatting from LLM-generated code
 *
 * This function handles various types of code block formatting that might be present
 * in the LLM output, including:
 * - Triple backticks with language identifiers (```svelte, ```html, ```js, etc.)
 * - Triple backticks without language identifiers
 * - Nested code blocks
 * - Improperly formatted code blocks
 *
 * @param code The code to clean
 * @returns The cleaned code with all markdown code block formatting removed
 */
export function cleanCodeMarkdown(code: string): string {
  // First, remove any opening code block markers with language identifiers
  // This handles patterns like ```svelte, ```html, ```js, etc.
  let cleanedCode = code.replace(/```[a-zA-Z]*\s*/g, "");

  // Remove any standalone triple backticks
  cleanedCode = cleanedCode.replace(/```/g, "");

  // Handle potential single or double backticks that might be leftover
  cleanedCode = cleanedCode.replace(/``|`/g, "");

  // Trim whitespace from the beginning and end
  return cleanedCode.trim();
}

  /**
   * Remove <think> ... </think> sections that some reasoning / thinking models emit.
   * These sections are not valid Svelte/HTML for our benchmark and should be fully stripped
   * before further processing / compilation. We remove both the tags and their inner content.
   *
   * This is a cautious non-greedy removal allowing for newlines and any attributes on the
   * opening tag (though providers typically emit bare <think>). Multiple occurrences are removed.
   */
  export function stripThinkTags(code: string): string {
    if (!code) return code;
    return code.replace(/<think[^>]*>[\s\S]*?<\/think>/gi, "").trim();
  }

  /**
   * High-level cleaner for LLM generated Svelte component code.
   * - Strips markdown code fences
   * - Removes <think> reasoning sections
   * - Trims leading/trailing whitespace
   */
  export function cleanGeneratedComponent(code: string): string {
    let result = cleanCodeMarkdown(code);
    result = stripThinkTags(result);
    return result.trim();
  }
