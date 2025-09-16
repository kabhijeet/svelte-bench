# Svelte 5 What's New LLM Summary

Svelte 5 is a UI framework that compiles components into optimized JavaScript, suitable for standalone elements or full-stack apps with SvelteKit.

### Getting Started

- **Quick Start**: `npx sv create myapp` (SvelteKit recommended) or `npm create vite@latest` (select Svelte).
- **Editor Support**: VS Code extension, `sv check`.

### Svelte Files

Components are `.svelte` files with three optional sections:

- **`<script module>`**: Runs once per module evaluation. Variables can be exported and accessed by component instances, but not vice-versa.
- **`<script>`**: Runs for each component instance. Top-level `let` variables are reactive and accessible in markup. Use `lang="ts"` for TypeScript.
- **`<style>`**: CSS is automatically scoped to the component, preventing style leaks.

Svelte 5 also supports `.svelte.js` and `.svelte.ts` files, which behave like regular JS/TS modules but can use runes for reactive logic, allowing shared state across modules.

### Svelte 5 Runes

Runes are compiler-controlled symbols prefixed with `$` (e.g., `$state`, `$derived`) that provide Svelte's reactivity. They are globally available and do not require imports.

- **`$state`**: Creates reactive state that triggers UI updates.
  - `let count = $state(0);`
  - Arrays and objects become deeply reactive proxies, updating UI on nested property changes. Destructuring breaks reactivity.
  - In classes, use `$state` for fields (`done = $state(false)`).
  - `$state.raw()`: Creates non-deeply reactive state; changes only trigger updates on reassignment.
  - `$state.snapshot()`: Creates a static, non-proxy copy of reactive state.
  - **Cross-module state**: To share reactive state across modules, export objects (`export const counter = $state({ count: 0 });`) or getter functions (`export function getCount() { return count; }`), not directly reassigned state.
- **`$derived`**: Creates reactive values that automatically update when their dependencies change.
  - `let doubled = $derived.by(() => count * 2);` (Always use `.by` for consistency, even for single expressions).
  - Reads any reactive state synchronously within its expression as a dependency.
  - Can be temporarily overridden for optimistic UI.
  - Unlike `$state`, `$derived` values are not deeply reactive proxies. Mutations on derived objects affect underlying state.
  - Updates are pushed to dependents but only recalculated when read; skipped if value is referentially identical.
- **`$effect`**: Runs side effects when state updates, useful for DOM manipulation, network requests, etc. Only runs in the browser.
  - `$effect(() => { /* side effect code */ });`
  - Runs after DOM mounting and in a microtask after state changes. Can return a cleanup function.
  - Automatically tracks synchronously read reactive values.
  - **Variants**: `$effect.pre` (runs before DOM updates), `$effect.tracking()` (checks if in tracking context), `$effect.root()` (creates a non-tracked scope with manual cleanup).
  - **Avoid for state synchronization**: Prefer `$derived` for derived state, or function bindings for linked values.
- **`$props`**: Defines component inputs.
  - `let { adjective } = $props();`
  - Supports fallback values, renaming, and rest props.
  - Props update when parent values change. Direct mutation of non-bindable props is discouraged and can trigger warnings if they are reactive proxies passed from a parent.
  - Type safety: Use `lang="ts"` and interfaces.
  - `$props.id()`: Generates a unique ID for component instances.
- **`$bindable`**: Enables two-way data flow for props, allowing child components to update parent state.
  - `let { value = $bindable(), ...props } = $props();`
  - Parent uses `bind:value={message}`.
  - Use sparingly to maintain clear data flow.
- **`$inspect`**: Development-only rune for debugging reactive state.
  - `$inspect(count, message);` logs values on change and pauses execution.
  - `.with()`: Customizes logging with a callback (e.g., `debugger`).
  - `.trace()`: Traces reactive dependencies.
- **`$host`**: Provides access to the host element when compiling a component as a custom element.
  - `$host().dispatchEvent(...)`

### Template Syntax

- **Tags**: Lowercase for HTML, capitalized/dot notation for components.
- **Attributes**: HTML attributes, JavaScript expressions (`disabled={!clickable}`), shorthand (`{disabled}`).
- **Component Props**: `<Widget foo={bar} {...things} />`.
- **Events**: `onclick={() => ...}` (case-sensitive, delegated). Use `{ bubbles: true }` for manual dispatches.
- **Text Expressions**: `{name}`. `null`/`undefined` are omitted. `{@html potentiallyUnsafeHtmlString}` injects raw HTML (sanitize!).
- **Comments**: HTML comments, `<!-- svelte-ignore -->` for warnings, `<!-- @component -->` for docs.

### Control Flow

- **`{#if expression}`**: Conditional rendering (`:else if`, `:else`).
- **`{#each expression as name (key)}`**: Iterate over arrays/iterables. `(key)` is crucial for efficient updates. Supports index and destructuring. `{:else}` block for empty lists.
- **`{#key expression}`**: Destroys and recreates content when `expression` changes, useful for re-instantiating components or triggering transitions.
- **`{#await promise}`**: Handles Promise states (`:then value`, `:catch error`). During SSR, only pending branch renders.

### Snippets

- **`{#snippet name(params)}...{/snippet}`**: Creates reusable markup chunks.
  - Accessed via `{@render name(args)}`.
  - Can have parameters with default values and destructuring.
  - Access outer scope values.
  - Visible to siblings and children, can reference themselves.
- **Passing Snippets to Components**:
  - **Explicit Props**: `<Table data={fruits} {header} {row} />` where `header` and `row` are snippets.
  - **Implicit Props**: Snippets declared inside a component become props (`<Table data={fruits}> {#snippet header()}...{/snippet} </Table>`).
  - **Implicit `children` Snippet**: Non-snippet content becomes the `children` prop (`<Button>click me</Button>` where `children` is a prop in `Button.svelte`).
  - **Optional Snippets**: Use `children?.()` or `{#if children}`.
- **Typing**: Use `Snippet` type from `svelte`.
- **Exporting**: Top-level snippets can be exported from `<script module>` (Svelte 5.5.0+).
- **Replaces Slots**: Snippets are the modern approach (slots are deprecated).

### Other Template Tags

- **`{@render ...}`**: Used to render snippets.
- **`{@html ...}`**: Injects raw HTML (sanitize content!). Styles applied via Svelte's scoping will not affect content within `{@html}` blocks; use `:global` instead.
- **`{@const ...}`**: Defines local constants within a block.
- **`{@debug ...}`**: Logs variables and pauses execution in development mode.

### Directives

- **`bind:value`**: Two-way data binding for form elements, media elements, dimensions, `contenteditable`, `details` and component props. Supports function bindings for custom logic.
- **`use:action`**: Actions are functions that run when an element is mounted. Useful for integrating third-party libraries or creating custom event dispatchers. Actions run once; parameters don't trigger re-runs.
- **`transition:name`**: CSS or JavaScript-based transitions triggered when elements enter/leave the DOM. Can be `local` or `global`.
- **`in:name` / `out:name`**: One-way transitions that don't reverse when interrupted.
- **`animate:name`**: Animations for elements within keyed `{#each}` blocks when reordered. Uses FLIP technique.
- **`style:prop`**: Shorthand for inline styles (`style:color="red"`), supports dynamic values and `|important` modifier.
- **`class:name`**: (Legacy) Adds/removes CSS classes based on truthiness (`class:cool={cool}`). Prefer using the `class` attribute with objects or arrays (`class={{ cool, lame: !cool }}`) in Svelte 5.16+.

### Styling

- **Scoped Styles**: `<style>` tags automatically scope styles to the component.
- **Global Styles**: Use `:global(...)` for specific selectors or `:global {}` for a block of global styles. Prepend global keyframes with `-global-`.
- **Custom Properties**: Pass CSS custom properties as props to components (e.g., `--track-color="black"`), accessible via `var(--track-color)`.
- **Nested `<style>` elements**: Not supported for Svelte's scoping; inserted directly into the DOM as-is.

### Special Elements

- **`<svelte:boundary>`**: Error boundaries that catch errors during component rendering and within top-level `$effect` execution (not in event handlers or async code). Provides a `failed` snippet for fallback UI and an `onerror` prop for programmatic handling.
- **`<svelte:window>`, `<svelte:document>`, `<svelte:body>`**: Attach event listeners and bind to properties on the global `window`, `document`, and `document.body` objects respectively. Must be at the top level of the component.
- **`<svelte:head>`**: Inserts elements into the `document.head` (for SEO, metadata). Must be at the top level.
- **`<svelte:element>`**: Renders a dynamic HTML element whose tag name is determined by an expression.
- **`<svelte:options>`**: Configures component compilation (`runes`, `namespace`, `customElement`).

### Runtime

- **Stores (`svelte/store`)**: Objects that hold reactive values via a contract (`.subscribe`, `.set` for writable). Use for complex async data or manual update control.
  - `writable()`: Creates a store with settable values.
  - `readable()`: Creates a store with read-only values.
  - `derived()`: Creates a store whose value is derived from other stores.
  - `readonly()`: Makes a store read-only.
  - `get()`: Retrieves a store's current value without subscribing.
  - In Svelte 5, runes are generally preferred over stores for most state management.
- **Context (`svelte`)**: Allows components to share values with descendants without prop drilling.
  - `setContext(key, value)`, `getContext(key)`.
  - When using state with context, update properties directly (`counter.count = 0`) instead of reassigning the object to maintain reactivity.
  - Safer than global state for SSR as it's not shared between requests.
- **Lifecycle Hooks (`svelte`)**:
  - `onMount()`: Runs after component mounts to DOM (not SSR). Can return a cleanup function.
  - `onDestroy()`: Runs before component unmounts (runs during SSR).
  - `tick()`: Returns a promise that resolves after pending state changes and DOM updates.
  - `beforeUpdate` and `afterUpdate` are deprecated in runes mode; use `$effect.pre` and `$effect` respectively.
- **Imperative Component API (`svelte`)**:
  - `mount()`: Creates and mounts a component to a target element. Effects require `flushSync()`.
  - `unmount()`: Removes a mounted component.
  - `render()`: (SSR only) Returns HTML.
  - `hydrate()`: Reuses SSR-rendered HTML and makes it interactive. Effects require `flushSync()`.

### Testing & TypeScript

- **Testing**: Use Vitest for unit/integration tests (with JSDOM for components) and Playwright for end-to-end tests. `flushSync()` is important for testing effects and DOM updates. `@testing-library/svelte` simplifies component tests.
- **TypeScript**: Add `lang="ts"` to scripts. SvelteKit/Vite preprocess for full TS support. `tsconfig.json` requires specific options (`target`, `verbatimModuleSyntax`, `isolatedModules`). Typing components (`$props`, generics, wrapper components), runes, and extending DOM types are supported.
