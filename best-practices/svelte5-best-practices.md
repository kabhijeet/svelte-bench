# Svelte 5 Best Practices

## 🧠 Runes

### `$state`
- Use `$state` for reactive UI state.
- Update `$state` variables directly (they behave like regular JavaScript variables).
- Use arrow functions for class methods relying on `this` with reactive state.
- Use `$state.raw` for large arrays/objects where deep reactivity isn't needed. 
- Use `$state.snapshot` to get a non-reactive copy of state for external libraries.
- Pass getter functions (e.g., `() => a`) to functions needing the current reactive value of `$state` variables.
- When sharing `$state` from `.svelte.js`/`.svelte.ts` files:
  - Export an object whose properties are mutated.
  - Or export getter functions.

### `$derived`
- Use `$derived` for computed values that are free of side effects.
- Use `$derived.by` for complex derivation logic.
- Derived values can be temporarily reassigned for optimistic UI updates.

### `$effect`
- Use `$effect` for side effects and external interactions (e.g., third-party libraries, API calls, analytics, DOM manipulation).
- Return a teardown function from `$effect` for cleanup (e.g., clearing intervals).
- Use `$effect.pre` for logic that must run before DOM updates.
- Use `$effect.tracking` to check if code is running in a tracking context.
- Use `$effect.root` for creating non-tracked scopes with manual cleanup for nested effects.
- Do not update state inside effects

## 🔄 Component Communication & Props
- Destructure props directly from `$props()` for clarity.
- Declare fallback values during destructuring.
- Rename props during destructuring if they are invalid JavaScript identifiers.
- Use rest properties (`...others`) to capture remaining props.
- Add type safety using TypeScript interfaces or JSDoc.
- Use `$props.id()` (Svelte 5.20.0+) for unique, consistent component instance IDs.
- Use callback properties for child-to-parent communication (replaces `createEventDispatcher`).

## 🐞 Debugging (`$inspect`)
- Use `$inspect` exclusively for development debugging; it tracks reactive state deeply.
- Use `$inspect.with()` for custom debugging actions (e.g., `debugger`, `console.trace`).
- Use `$inspect.trace()` (Svelte 5.14+) to trace function re-runs and identify causes.

## ♻️ Reusable Logic & State
- Use `.svelte.js` and `.svelte.ts` files to create reusable reactive logic and share reactive state using runes.
- Keep state logic separate from the wire components.

## 🧱 Component Structure
- Use `<script>` for component-specific logic.
- Use `<style>` for scoped CSS.
- Maintain clear data flow and effective architecture for maintainability.

## 🔗 `bind:` Directive (Two-Way Data Binding)
- Use `bind:` for two-way data flow from child to parent.
- Use shorthand `bind:property` when names match.
- Use function bindings (get/set) for validation or transformation (Svelte 5.9.0+).
- For readonly bindings, set the get function to `null`.
- Access `bind:this` variables inside `$effect` or event handlers (they are undefined until mount).
- Mark bindable properties with `$bindable()`.
- Provide fallback values for `$bindable()` properties.

## 🧩 Template Syntax
- Use `{#if expression}` for conditionals.
- Use `{#each expression as item}` for lists.
- Use `{#key value}` to force re-creation of content.
- Use `{#await promise}` for managing Promise states.
- Use snippets for reusable markup chunks.

## 🎉 Event Handling
- Use standard HTML attributes for event handling (onclick, onsubmit, etc.)
- For event modifiers, use wrapper functions instead of the pipe syntax from Svelte 4
- For multiple handlers, combine them into a single function
- Keep event handlers simple, moving complex logic to separate functions
- Remember that event names are lowercase in HTML (onclick, not onClick)Event Handing

## Component Events
- Use callback props instead of event dispatching for component communication
- Name callback props with an "on" prefix (e.g., onSubmit, onChange)
- Pass data as an object to allow for future extensibility
- For multiple events, use multiple callback props
- Consider using TypeScript to type your callback props

## Snippets
- Use snippets to reduce duplication in your templates
- Snippets can be passed as props to components
- Snippets have lexical scoping rules - they are only visible in the same scope they are defined in
- Use parameters to make snippets more flexible
- Snippets can reference other snippets and even themselves (for recursion)

## 🏪 Store
- Use stores only for:
  - Interoperability with external libraries.
  - Complex async data streams.
  - Large apps.
  - Scenarios needing explicit subscribe/unsubscribe behavior.

## 🧠 Context
- Store reactive state in context for child component access.
- Wrap `setContext` and `getContext` in helper functions for type safety.
- Context can and should be used for small to medium-sized applications to share state between components. It is also ideal for shared state, especially in SSR, as it avoids cross-request data leakage.

## 🧠 Context
- Store reactive state in context for child component access.
- Wrap `setContext` and `getContext` in helper functions for type safety.
- Context is ideal for shared state, especially in SSR, as it avoids cross-request data leakage.

## 🧪 Testing
- Use **Vitest** for unit and integration testing.
- Adjust `vite.config.js` to use browser entry points or alias backend libraries.
- Include `.svelte` in test filenames for rune processing.
- Wrap `$effects` in `$effect.root` during tests.
- Use `flushSync` to run pending effects synchronously.
- Use https://testing-library.com/docs/svelte-testing-library/intro.
- Use **Playwright** for E2E testing.

## 📦 Packages
- Explore new/popular packages at https://www.sveltesociety.dev/packages.

## 🔐 Security
- To prevent XSS attacks:
  - Escape strings passed to `{@html ...}`.
  - Ensure content is from trusted sources.
  - The expression must be valid standalone HTML.

## 🧱 Error Boundaries
- Use `onerror` to integrate with error reporting services.
- Wrap flaky components in `<svelte:boundary>` to isolate errors.
- `<svelte:boundary>` requires a failed snippet or `onerror` function.
- It does **not** catch errors outside rendering (e.g., event handlers, `setTimeout`, async work).