# Svelte 5 Anti-Patterns

## Event Handling
- Do not use `on:click`, `on:submit`, or other Svelte 4-style event directives in Svelte 5. Use standard HTML event attributes like `onclick`, `onsubmit`, etc. instead.

## Legacy Practices
- Do not rely on implicit reactivity from Svelte 4 (`let` declarations, `$:` statements`).
- Use modern Svelte 5 APIs instead of legacy APIs (e.g., prefer callback props over `createEventDispatcher`).

## Build Tools
- Use SvelteKit for new projects; do not opt for plain Vite, Rollup, or Webpack plugins.
  - **Note:** SvelteKit is strongly recommended and centralizes best practices.

## Runes Misuse

### General
- Do not use runes from Svelte 4 and prior (will cause compilation errors).
- Do not import runes, they are part of the language

### `$state`
- Do not directly mutate `$state.raw` values (will not trigger reactive updates).
- Do not directly export reassigned `$state` variables from `.svelte.js`/`.svelte.ts` modules (leads to non-reactive behavior for imports).
- Do not mutate state you do not "own" (i.e., only mutate props marked `$bindable`).
- For large collections, prefer using `$state.raw` for better performance, and always reassign the collection when making changes.
- When updating state objects, avoid direct mutation of nested properties; instead, create new objects to ensure predictable state changes.


### `$derived`
- Do not change state (e.g., `count++`) directly within `$derived` expressions.
- Avoid creating circular dependencies between derived values and state, as this can lead to infinite update loops.
### State Management Patterns
- Do not export state variables directly; instead, provide getter and setter functions to access and update state, preserving reactivity.
- When exporting objects containing state, use getters and setters for stateful properties to maintain reactivity in consuming modules.

### `$effect`
- Do not update state directly within `$effect` functions (can lead to convoluted code and infinite loops).
- Do not use `$effect` to synchronize state or derive new `$state` variables; use `$derived` for derivations.
- Do not link mutually dependent input values using `$effect`; use `oninput` callbacks or function bindings instead.
- Do not assume values read asynchronously (e.g., after `await` or in `setTimeout`) within an `$effect` are tracked as dependencies.
- Do not expect an `$effect` to re-run when a property inside a mutated object changes if the object reference itself remains the same.

## Component Communication
- Do not directly mutate props unless they are explicitly declared as `$bindable()`.
- Do not mutate a reactive state proxy passed as a prop in a child component (triggers `ownership_invalid_mutation` warning).
- Do not mutate fallback values of non-bindable props (will not trigger updates).
- Do not provide `undefined` to a `$bindable()` property that has a fallback value and is bound (results in a runtime error).

### Common Props Mistakes (Svelte 5)
- Always destructure needed props from `$props()` for reactivity; do not use the whole props object.
- Always provide default values for optional props when destructuring.
- Use `$bindable()` for two-way binding props.
- Do not modify props directly; use callbacks to update parent state.
- Use TypeScript types for complex props.

## Debugging
- Do not leave `$inspect` calls in production code (clutters code, even if they become no-ops).
- Do not overuse `$inspect` (leads to overwhelming console output).
- Do not use `$inspect` as a substitute for well-structured state management.

## Reusable Reactive Logic
- Do not export reassigned state directly from `.svelte.js`/`.svelte.ts` files (results in non-reactive behavior for external imports).

## `bind:` Directive
- Do not use reset buttons in forms too frequently (can lead to accidental data loss — more of a UX warning).
- Do not expect `DataTransfer` to be available for `bind:files` in server-side JavaScript runtimes (state should be left uninitialized for SSR).
- Do not use dimension bindings (`bind:offsetWidth`, etc.) on elements with `display: inline` (their dimensions are not observable; change display style).
- Do not expect dimension bindings to update if an element's size changes solely due to CSS transformations.
- Do not use the `bind:group` directive across different components (only works for inputs within the same Svelte component).
- Do not provide `undefined` to a bound `$bindable()` property that has a fallback value (results in a runtime error).

## Asynchronous Operations (`{#await...}`)
- Do not expect any branch other than the pending branch of an `{#await}` block to render during server-side rendering (SSR).

## Keyed Blocks (`{#key...}`)
- Do not use a constantly changing key value in `{#key}` blocks (leads to excessive DOM manipulation and potential performance degradation).

## Attributes
- Do not declare custom ßproperties or attributes that start with `on`.
