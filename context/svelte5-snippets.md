# Svelte 5 Snippets

Snippets are a way to create reusable chunks of markup inside your components. They replace the need for duplicative code and provide a more powerful alternative to slots.

## ⚠️ CRITICAL SYNTAX WARNING ⚠️ 

**Snippets use Svelte syntax, NOT JSX. NEVER use `return` statements or JSX elements like `<span>`.**

```svelte
<!-- ❌ WRONG - JSX syntax with return (WILL CAUSE PARSE ERROR) -->
<script>
	snippet title(text) {
		return <span>{text}</span>; // ❌ This is JSX, not Svelte!
	}
</script>

<!-- ❌ WRONG - JSX without return (STILL WRONG) -->
<script>
	snippet title(text) {
		<span>{text}</span> // ❌ Still JSX syntax!
	}
</script>

<!-- ✅ CORRECT - Pure Svelte syntax with NO RETURN -->
<script>
	snippet title(text) {
		<span>{text}</span>
	}
</script>

<!-- ✅ ALTERNATIVE CORRECT - Using curly braces -->
<script>
	snippet title(text) {
		{text}
	}
</script>
```

**CRITICAL RULES FOR SNIPPETS:**
1. ❌ NEVER use `return` keyword
2. ❌ NEVER use JSX syntax like `<span>`  
3. ✅ ALWAYS use pure Svelte template syntax
4. ✅ Snippets contain template markup, not JavaScript expressions## Basic Syntax

**Always use the `{#snippet}` template syntax, never JavaScript functions:**

```svelte
{#snippet name()}...{/snippet}
```

```svelte
{#snippet name(param1, param2, paramN)}...{/snippet}
```

## Complete Working Example

**Copy this exact implementation - all syntax is tested and verified:**

```svelte
<svelte:options runes={true} />

<script>
	const bookTitles = [
		"The Lord of the Rings",
		"To Kill a Mockingbird",
		"1984"
	];
</script>

{#snippet title(bookTitle)}
	<span data-testid="book-title">{bookTitle}</span>
{/snippet}

<ul>
	{#each bookTitles as book}
		<li data-testid="book-item">
			{@render title(book)}
		</li>
	{/each}
</ul>
```

**Key Points for the Example Above:**
- ✅ Use `{#snippet title(bookTitle)}` - NOT `const title = snippet(...)`
- ✅ Close with `{/snippet}` 
- ✅ Render with `{@render title(book)}`
- ✅ Include proper `data-testid` attributes

## Common Mistakes to Avoid

### ❌ Wrong: JavaScript Function Syntax
```javascript
// This is NOT how snippets work in Svelte
const title = snippet((bookTitle) => {
    return (
        <span data-testid="book-title">{bookTitle}</span>
    );
});
```

### ❌ Wrong: JSX Return Statements  
```javascript
// This will cause a parse error
const title = snippet((bookTitle) => {
    return <span>{bookTitle}</span>;
});
```

### ✅ Correct: Svelte Template Syntax
```svelte
{#snippet title(bookTitle)}
    <span data-testid="book-title">{bookTitle}</span>
{/snippet}
```

**Remember: Snippets are template constructs, not JavaScript functions!**

## Simple Example

Instead of duplicating markup:

```svelte
{#each images as image}
	{#if image.href}
		<a href={image.href}>
			<figure>
				<img src={image.src} alt={image.caption} />
				<figcaption>{image.caption}</figcaption>
			</figure>
		</a>
	{:else}
		<figure>
			<img src={image.src} alt={image.caption} />
			<figcaption>{image.caption}</figcaption>
		</figure>
	{/if}
{/each}
```

Use snippets:

```svelte
{#snippet figure(image)}
	<figure>
		<img src={image.src} alt={image.caption} />
		<figcaption>{image.caption}</figcaption>
	</figure>
{/snippet}

{#each images as image}
	{#if image.href}
		<a href={image.href}>
			{@render figure(image)}
		</a>
	{:else}
		{@render figure(image)}
	{/if}
{/each}
```

Snippets can have parameters with default values and destructuring. Rest parameters are not supported.

## Snippet Scope

Snippets can reference values from their lexical scope:

```svelte
<script>
	let { message = `it's great to see you!` } = $props();
</script>

{#snippet hello(name)}
	<p>hello {name}! {message}!</p>
{/snippet}

{@render hello('alice')}
{@render hello('bob')}
```

Snippets are visible to siblings and children in the same lexical scope. They can reference themselves and each other for recursive patterns.

## Passing Snippets to Components

### Explicit Props

```svelte
<!-- Parent.svelte -->
<script>
	import Table from './Table.svelte';
	const fruits = [
		{ name: 'apples', qty: 5, price: 2 },
		{ name: 'bananas', qty: 10, price: 1 }
	];
</script>

{#snippet header()}
	<th>fruit</th>
	<th>qty</th>
	<th>price</th>
{/snippet}

{#snippet row(d)}
	<td>{d.name}</td>
	<td>{d.qty}</td>
	<td>{d.price}</td>
{/snippet}

<Table data={fruits} {header} {row} />
```

### Implicit Props

Snippets declared inside a component automatically become props:

```svelte
<Table data={fruits}>
	{#snippet header()}
		<th>fruit</th>
		<th>qty</th>
	{/snippet}

	{#snippet row(d)}
		<td>{d.name}</td>
		<td>{d.qty}</td>
	{/snippet}
</Table>
```

### Implicit `children` Snippet

Content that isn't a snippet declaration becomes the `children` snippet:

```svelte
<!-- App.svelte -->
<Button>click me</Button>
```

```svelte
<!-- Button.svelte -->
<script>
	let { children } = $props();
</script>

<button>{@render children()}</button>
```

### Optional Snippets

```svelte
<script>
	let { children } = $props();
</script>

{@render children?.()}

<!-- or with fallback -->
{#if children}
	{@render children()}
{:else}
	fallback content
{/if}
```

## TypeScript Support

Snippets implement the `Snippet` interface:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		data: any[];
		children: Snippet;
		row: Snippet<[any]>;
	}

	let { data, children, row }: Props = $props();
</script>
```

Use generics for type safety:

```svelte
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		data,
		children,
		row
	}: {
		data: T[];
		children: Snippet;
		row: Snippet<[T]>;
	} = $props();
</script>
```

## Exporting Snippets

Snippets can be exported from `<script module>` (requires Svelte 5.5.0+):

```svelte
<script module>
	export { add };
</script>

{#snippet add(a, b)}
	{a} + {b} = {a + b}
{/snippet}
```

## Key Points

- Snippets replace slots from Svelte 4 and are more powerful and flexible
- They can have parameters with default values and destructuring
- Snippets can be passed as props to components
- They support TypeScript typing with the `Snippet` interface
- Content inside component tags automatically becomes the `children` snippet
- Avoid props named `children` if using implicit children snippets
- For advanced use cases, use the `createRawSnippet` API
