# Svelte 4 to Svelte 5 Migration Guide

Comprehensive migration patterns showing syntax changes from Svelte 4 to Svelte 5, focusing on the new runes system and updated event handling.

## Key Changes

- [`$state()`](https://svelte.dev/docs/svelte/state) replaces reactive variables
- [`$derived()`](https://svelte.dev/docs/svelte/derived) replaces reactive declarations
- [`$props()`](https://svelte.dev/docs/svelte/props) replaces export syntax
- [`$effect()`](https://svelte.dev/docs/svelte/effect) replaces lifecycle methods
- Event handlers use `onclick` instead of `on:click`
- Snippets replace named slots

## Reactive State

**Svelte 4:**
```svelte
<script>
  let count = 0;
</script>
<button on:click={() => count++}>Count: {count}</button>
```

**Svelte 5:**
```svelte
<script>
  let count = $state(0);
</script>
<button onclick={() => count++}>Count: {count}</button>
```

## Props & Derived State

**Svelte 4:**
```svelte
<script>
  export let name;
  export let age = 21;
  $: greeting = `Hello ${name}`;
</script>
```

**Svelte 5:**
```svelte
<script>
  let { name, age = 21 } = $props();
  const greeting = $derived(`Hello ${name}`);
</script>
```

## Effects & Lifecycle

**Svelte 4:**
```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    const timer = setInterval(() => count++, 1000);
    onDestroy(() => clearInterval(timer));
  });
</script>
```

**Svelte 5:**
```svelte
<script>
  $effect(() => {
    const timer = setInterval(() => count++, 1000);
    return () => clearInterval(timer);
  });
</script>
```

## Component Communication

**Svelte 4:**
```svelte
<!-- Child.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>
<button on:click={() => dispatch('message', 'data')}>Send</button>

<!-- Parent.svelte -->
<Child on:message={(e) => console.log(e.detail)} />
```

**Svelte 5:**
```svelte
<!-- Child.svelte -->
<script>
  let { onMessage } = $props();
</script>
<button onclick={() => onMessage?.('data')}>Send</button>

<!-- Parent.svelte -->
<Child onMessage={(data) => console.log(data)} />
```

## Migration Notes

- Use [`$state.frozen()`](https://svelte.dev/docs/svelte/state#$state.frozen) for immutable objects
- [`$derived.by()`](https://svelte.dev/docs/svelte/derived#$derived.by) for complex derivations
- Event modifiers like `preventDefault` must be handled manually
- Stores still work but consider using [`$state()`](https://svelte.dev/docs/svelte/state) for component-local state
