import { describe, it, expect } from 'vitest';
import { cleanCodeMarkdown, stripThinkTags, cleanGeneratedComponent } from './code-cleaner';

describe('code-cleaner utilities', () => {
  it('cleanCodeMarkdown removes ``` fences and language identifiers', () => {
    const input = '```svelte\n<div>Hi</div>\n```';
    expect(cleanCodeMarkdown(input)).toBe('<div>Hi</div>');
  });

  it('stripThinkTags removes single <think> block', () => {
    const input = '<think>reasoning here</think>\n<div>Content</div>';
    expect(stripThinkTags(input)).toBe('<div>Content</div>');
  });

  it('stripThinkTags removes multiple <think> blocks with newlines', () => {
    const input = '<think>one</think>\n<div>A</div>\n<think>two\nmore</think>\n<span>B</span>';
    expect(stripThinkTags(input)).toBe('<div>A</div>\n<span>B</span>');
  });

  it('cleanGeneratedComponent composes markdown + think stripping', () => {
    const input = '```svelte\n<think>internal chain of thought</think>\n<section>Ok</section>\n```';
    expect(cleanGeneratedComponent(input)).toBe('<section>Ok</section>');
  });

  it('cleanGeneratedComponent preserves valid Svelte syntax surrounding think blocks', () => {
    const input = `<script>\n  let count = 0;\n</script>\n<think>should be gone</think>\n<button on:click={() => count++}>{count}</button>`;
    expect(cleanGeneratedComponent(input)).toBe(`<script>\n  let count = 0;\n</script>\n<button on:click={() => count++}>{count}</button>`);
  });

  // Edge case tests
  describe('stripThinkTags edge cases', () => {
    it('removes uppercase THINK tags', () => {
      const input = '<THINK>Reasoning A</THINK>\n<p>Hi</p>';
      expect(stripThinkTags(input)).toBe('<p>Hi</p>');
    });

    it('removes multiline think with inner angle brackets', () => {
      const input = `<think>\nLine 1 <div> not real tag\nLine 2 </div> still inside think\n</think>\n<button>OK</button>`;
      expect(stripThinkTags(input)).toBe('<button>OK</button>');
    });
  });
});
