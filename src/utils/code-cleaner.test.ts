import { describe, it, expect } from 'vitest';
import { cleanCodeMarkdown, stripThinkTags, cleanGeneratedComponent, fixTemplateLiterals, fixIncompleteHTMLTags, addMissingInputAttributes } from './code-cleaner';

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

describe('fixTemplateLiterals', () => {
  it('fixes console.log with missing backticks around template literals', () => {
    const input = 'console.log(Text updated to: "${value}");';
    const expected = 'console.log(`Text updated to: "${value}"`);';
    expect(fixTemplateLiterals(input)).toBe(expected);
  });

  it('fixes multiple console.log statements with template literal issues', () => {
    const input = 'console.log(Count: ${count});\nconsole.log(Value: ${text});';
    const expected = 'console.log(`Count: ${count}`);\nconsole.log(`Value: ${text}`);';
    expect(fixTemplateLiterals(input)).toBe(expected);
  });

  it('preserves correctly formatted template literals', () => {
    const input = 'console.log(`Text updated to: "${value}"`);';
    expect(fixTemplateLiterals(input)).toBe(input);
  });

  it('preserves regular console.log statements without interpolation', () => {
    const input = 'console.log("Simple message");';
    expect(fixTemplateLiterals(input)).toBe(input);
  });

  it('handles complex Svelte code with $inspect syntax errors', () => {
    const input = `if (type === "update") {
  console.log(Text updated to: "\${value}");
}`;
    const result = fixTemplateLiterals(input);
    expect(result).toContain('console.log(`Text updated to: "${value}"`);');
  });
});

describe('fixIncompleteHTMLTags', () => {
  it('fixes incomplete input tags', () => {
    const input = `<input \n\t<p>content</p>`;
    const expected = `<input />\n\t<p>content</p>`;
    expect(fixIncompleteHTMLTags(input)).toBe(expected);
  });

  it('fixes the exact failing pattern from benchmark results', () => {
    const input = `<label for="text-input">Edit text:</label>
\t<input 
\t<p>content</p>`;
    const expected = `<label for="text-input">Edit text:</label>
\t<input />\n\t<p>content</p>`;
    expect(fixIncompleteHTMLTags(input)).toBe(expected);
  });

  it('preserves correctly formatted self-closing tags', () => {
    const input = `<input type="text" />\n<img src="test.jpg" />`;
    expect(fixIncompleteHTMLTags(input)).toBe(input);
  });

  it('preserves non-self-closing tags', () => {
    const input = `<div>\n\t<p>content</p>\n</div>`;
    expect(fixIncompleteHTMLTags(input)).toBe(input);
  });

  it('handles multiple incomplete tags', () => {
    const input = `<div>
\t<img 
\t<input 
\t<p>content</p>
\t<br 
\t<span>text</span>
</div>`;
    const expected = `<div>
\t<img />
\t<input />
\t<p>content</p>
\t<br />
\t<span>text</span>
</div>`;
    expect(fixIncompleteHTMLTags(input)).toBe(expected);
  });
});

describe('addMissingInputAttributes', () => {
  it('handles missing attributes in properly closed input tags', () => {
    const input = `<div>
  <label for="text-input">Edit text:</label>
  <input />
  <p data-testid="text-value">Current text: "{text}"</p>
</div>`;
    const expected = `<div>
  <label for="text-input">Edit text:</label>
  <input 
\t\tdata-testid="text-input" 
\t\tid="text-input" 
\t\ttype="text" 
\t\tbind:value={text} 
\t/>
  <p data-testid="text-value">Current text: "{text}"</p>
</div>`;
    expect(addMissingInputAttributes(input)).toBe(expected);
  });
});
