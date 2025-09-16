# Tailwind CSS v4 vs v5 – LLM Summary (2k context)

## Key Breaking Changes and New Features

### 1. CSS Import and Directives

- The `@tailwind` directives (`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`) are replaced with a standard CSS `@import "tailwindcss";` statement. This simplifies the entry point for the framework.
- For PostCSS users, `tailwindcss` is no longer a direct PostCSS plugin; it now lives in a dedicated `@tailwindcss/postcss` package. `postcss-import` and `autoprefixer` are no longer needed as imports and vendor prefixing are handled automatically by Tailwind v4.
- Vite users are encouraged to migrate to the new `@tailwindcss/vite` plugin for improved performance and developer experience.
- The Tailwind CLI is now in a dedicated `@tailwindcss/cli` package, requiring updates to build commands (e.g., `npx @tailwindcss/cli -i input.css -o output.css`).

### 2. Utility Renames and Removals

- **Removed Deprecated Utilities:** Utilities that were deprecated in v3 and undocumented for years have been removed. This includes all `*-opacity-*` utilities (e.g., `bg-opacity-50`, `text-opacity-25`), which are now replaced by opacity modifiers like `bg-black/50`. Also removed are `flex-shrink-*` (use `shrink-*`), `flex-grow-*` (use `grow-*`), `overflow-ellipsis` (use `text-ellipsis`), and `decoration-slice`/`decoration-clone` (use `box-decoration-slice`/`box-decoration-clone`).
- **Renamed Utilities:** Several utilities have been renamed for consistency and predictability:
  - `shadow-sm` becomes `shadow-xs`, `shadow` becomes `shadow-sm`, and `shadow` is now the default `shadow-sm`. Similar changes apply to `drop-shadow`, `blur`, and `backdrop-blur` scales (e.g., `blur` becomes `blur-sm`).
  - `rounded-sm` becomes `rounded-xs`, `rounded` becomes `rounded-sm`, and `rounded` is now the default `rounded-sm`.
  - `outline-none` is renamed to `outline-hidden` and specifically sets an invisible outline for accessibility. A _new_ `outline-none` utility now genuinely sets `outline-style: none`. The base `outline` utility defaults to `outline-width: 1px`, making it consistent with borders and rings.
- **Ring Width and Color:** The default `ring` width changed from 3px to 1px. To maintain v3 behavior, `ring` should be replaced with `ring-3`. The default `ring` color is now `currentColor` instead of `blue-500`; `ring-blue-500` must be explicitly added if the blue color is desired.

### 3. Layout and Spacing

- **Space-between Selector:** The `space-x-*` and `space-y-*` utilities now use a new selector (`:not(:last-child)`) instead of `:not([hidden]) ~ :not([hidden])` for improved performance on large pages. This change might affect inline elements or custom margins on child elements. Migrating to flex or grid layouts with `gap` is recommended as an alternative.

### 4. Gradients

- **Variant overrides on gradients** (e.g., `dark:from-blue-500`) now preserve other gradient values by default, which is more consistent with how other utilities work. This means `via-none` might be needed to explicitly "unset" a three-stop gradient back to two stops in specific states.

### 5. Configuration

- **Container Configuration:** The `center` and `padding` options for the `container` utility are removed. Customization is now done using the `@utility` directive (e.g., `@utility container { margin-inline: auto; padding-inline: 2rem; }`).
- **Default Border and Divide Colors:** `border-*` and `divide-*` utilities now default to `currentColor` instead of `gray-200` to be less opinionated and align with browser defaults. Explicit color specification (e.g., `border-gray-200`) is now required or the v3 `gray-200` default can be restored via `@layer base` CSS.
- **Prefixes:** Prefixes (e.g., `tw:`) now behave like variants and must appear at the beginning of the class name (e.g., `tw:flex tw:bg-red-500`). Theme variables should still be configured without the prefix, as the generated CSS variables will automatically include the prefix (e.g., `--tw-font-display`).
- **Custom Utilities:** The `@layer utilities` and `@layer components` directives are replaced by the new `@utility` API for defining custom utility classes. Custom utilities are now sorted based on the number of properties they define, allowing component utilities to be more easily overridden by other Tailwind utilities.
- **Variant Stacking Order:** Stacked variants now apply from left-to-right (e.g., `*:first:pt-0`) instead of right-to-left (`first:*:pt-0`) to better resemble CSS syntax.
- **Variables in Arbitrary Values:** Using CSS variables as arbitrary values now requires parentheses `bg-(--brand-color)` instead of square brackets `bg-[--brand-color]` due to recent CSS ambiguity concerns.
- **`corePlugins` Removal:** The `corePlugins` option for disabling specific utilities is no longer supported.
- **`theme()` Function:** Direct CSS variables (e.g., `var(--color-red-500)`) are preferred over the `theme()` function for theme values. For cases like media queries where CSS variables aren't supported, the `theme()` function should use the CSS variable name (`theme(--breakpoint-xl)`) instead of dot notation.
- **JavaScript Config Files:** JavaScript config files are no longer auto-detected and must be explicitly loaded using the `@config` directive (e.g., `@config "../../tailwind.config.js";`). The `corePlugins`, `safelist`, and `separator` options from JavaScript configs are not supported.
- **`resolveConfig` Removal:** The `resolveConfig` function, previously used to flatten JavaScript configs for JS consumption, has been removed. Users are encouraged to leverage generated CSS variables directly via `getComputedStyle` for JavaScript access (e.g., `getComputedStyle(document.documentElement).getPropertyValue("--shadow-xl")`).

### 6. Interactivity and Animations

- **Hover Styles on Mobile:** The `hover` variant now applies only if the primary input device supports hover (`@media (hover: hover)`). This prevents touch devices from triggering hover on tap by default. If the old behavior is needed, a custom variant can be defined using `@custom-variant hover (&:hover);`.
- **Transitioning `outline-color`:** The `transition` and `transition-color` utilities now include the `outline-color` property. This means `outline-color` will transition, which might require explicitly setting outline color for both states to prevent unwanted transitions.

### 7. Preflight Changes

- **New Default Placeholder Color:** Placeholder text now uses the current text color at 50% opacity, simplified from `gray-400`. V3 behavior can be restored via `@layer base` CSS.
- **Buttons `cursor: default`:** Buttons now use `cursor: default` to match browser defaults. To restore `cursor: pointer`, add a `@layer base` rule for buttons.
- **Dialog Margins Removed:** `dialog` elements now have their margins reset in Preflight. To re-center dialogs, add `margin: auto;` to `dialog` within `@layer base`.

### 8. Integration Specifics

- **`@apply` with Bundled Stylesheets (Vue, Svelte, CSS Modules):** Stylesheets bundled separately (e.g., CSS modules, `<style>` blocks in frameworks) no longer have access to theme variables, custom utilities, or custom variants defined in other files. The `@reference` directive can be used to import these definitions without duplicating CSS. Alternatively, direct CSS variables (e.g., `color: var(--text-red-500);`) are recommended over `@apply` for performance.
- **Incompatibility with CSS Preprocessors:** Tailwind CSS v4.0 is explicitly _not_ designed to be used with CSS preprocessors like Sass, Less, or Stylus, considering Tailwind itself as the preprocessor. This means these preprocessors cannot be used for stylesheets or `<style>` blocks in frameworks.
