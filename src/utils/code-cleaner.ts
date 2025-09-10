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
   * Remove ChatML / role-delimiter tokens and blocks that some providers emit, e.g.
   *   <|channel|>analysis<|message|>
   * or blocks like
   *   <|channel|>analysis
   *   <|message|>...actual content...
   *
   * We remove paired tokens and any short label text between them first, then
   * remove any remaining isolated tokens.
   */
  export function stripChatMLTokens(code: string): string {
    if (!code) return code;
    let result = code;
    // Remove paired token blocks with any content between them (non-greedy)
    result = result.replace(/<\|[^|]+\|>[\s\S]*?<\|[^|]+\|>/g, "");
    // Remove remaining single tokens like <|channel|> or <|message|>
    result = result.replace(/<\|[^>]*\|>/g, "");
    // Also defensively remove HTML-escaped variants
    result = result.replace(/<\|[^>]*\|>/g, "");
    return result;
  }
 
  /**
   * Extract the Svelte component portion from a noisy LLM response.
   * Keeps:
   *  - the entire <script>...</script> block(s)
   *  - any lines that start with an HTML tag (e.g. "<div", "<input", "<p", etc.)
   *  - blank lines for spacing
   *
   * This is a conservative heuristic that removes explanatory prose inserted
   * between or after code blocks while preserving valid Svelte markup.
   */
  export function extractSvelteComponent(code: string): string {
    if (!code) return code;
    const lines = code.split(/\r?\n/);
    const out: string[] = [];
    let inScript = false;
    for (const line of lines) {
      const trimmed = line.trim();
      // Start of script block
      if (/^<script\b/i.test(trimmed)) {
        inScript = true;
        out.push(line);
        continue;
      }
      if (inScript) {
        out.push(line);
        if (/<\/script>/i.test(trimmed)) {
          inScript = false;
        }
        continue;
      }
      // Skip stray closing </script> that appears outside a script block
      if (/^<\/script>/i.test(trimmed)) {
        // ignore orphan closing tag emitted as narrative
        continue;
      }
      // Keep lines that look like HTML tags or Svelte syntax (start with '<' or '{' or are empty)
      if (/^\s*</.test(line) || /^\s*\{/.test(line) || trimmed === "") {
        out.push(line);
      }
      // Otherwise drop the line as likely narrative/explanation
    }
    return out.join("\n").trim();
  }
 
  /**
   * High-level cleaner for LLM generated Svelte component code.
   * - Strips markdown code fences
   * - Removes ChatML role tokens like <|channel|>
   * - Removes <think> reasoning sections
   * - Extracts likely Svelte component content
   * - Trims leading/trailing whitespace
   */
  /**
   * Remove any $inspect.trace() calls from code.
   * Conservative: deletes the call so Svelte's placement restriction is avoided.
   */
  export function removeInspectTraceCalls(code: string): string {
    if (!code) return code;
    return code.replace(/\$inspect\.trace\s*\(\s*\)\s*;?/g, "");
  }
 
  export function cleanGeneratedComponent(code: string): string {
    let result = cleanCodeMarkdown(code);
    // Remove ChatML-style role tokens/blocks first
    result = stripChatMLTokens(result);
    // Remove any <think> reasoning blocks
    result = stripThinkTags(result);
    // Extract only lines that are valid Svelte component content
    result = extractSvelteComponent(result);
    // Remove $inspect.trace() occurrences (placement-sensitive in Svelte)
    result = removeInspectTraceCalls(result);
    // Final trim of whitespace and stray backticks
    return result.replace(/```/g, "").trim();
  }
