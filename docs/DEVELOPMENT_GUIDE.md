# 7. Developer & Modification Guide

## 7.1 Development Environment Setup

RazorTerminal is built on [Bun](https://bun.sh) and TypeScript.

### 1. Install Bun
If Bun is not already installed on your system:

- **Windows (PowerShell)**:
  ```powershell
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
- **macOS / Linux**:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

### 2. Install Project Dependencies
Run from the repository root:
```bash
bun install
```
> [!NOTE]
> `bun install` automatically applies custom patches from the [`patches/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/patches/) directory to `@opentui/core`, `electrobun`, and `react-reconciler`.

---

## 7.2 Core Development Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts the Terminal UI in live-reload watch mode. |
| `bun run start` | Runs the Terminal UI entrypoint once. |
| `bun run desktop:dev` | Launches the Electrobun Desktop app in development mode with live reload. |
| `bun run desktop:build` | Compiles the standalone Desktop application. |
| `bun run desktop:release:windows` | Builds the signed Windows x64 desktop installer. |
| `bun run web:build` | Compiles the static web bundle for the browser edition. |
| `bun run typecheck` | Runs multi-target TypeScript checks across all tsconfigs (`opentui`, `electrobun`, `browser`, `cloudflare`, `scripts`). |
| `bun test` | Runs the full Bun test suite. |
| `bun run i18n:audit` | Verifies translation coverage across all supported languages. |

---

## 7.3 Core Engineering Rules & Best Practices

When modifying or adding code to RazorTerminal, adhere to the principles established in [`AGENTS.md`](file:///c:/Users/patil/OneDrive/Desktop/zzz/AGENTS.md):

### 1. UI & Renderer Neutrality
- **Never import OpenTUI, Electrobun, or DOM packages directly in feature panes or plugins.**
- Always import UI primitives from [`src/ui/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/ui/) (e.g. `Box`, `Text`, `ChartSurface`, `ContextMenuProvider`).
- For Desktop/Web UI, do **not** draw GUI shapes with terminal ASCII/cell characters. Use real CSS/canvas/SVG primitives.
- Ensure all interactive elements handle mouse/pointer clicks as well as keyboard shortcuts.

### 2. Information Density & Clean Layouts
- **Never repeat information**: If a pane title or header already names a ticker (e.g. `AAPL`), do not repeat `AAPL` at the top of the pane body.
- **Dynamic Pane Footers**: Status bars and footers must only show state that can change (loading, error, live/delayed, stale, or auth state). Do not use them for static labels or generic keyboard hints.

### 3. Testing Conventions
- **Be selective**: Add or keep tests only for behavior that is easy to break and hard to catch in review (parser/math/state complexity, cache/persistence behavior, regression failure modes).
- **Avoid weak test targets**: Do not test static props, copied UI text, or simple pass-through wiring.

---

## 7.4 Common Modification Recipes

### Recipe 1: Adding a New Built-in Pane

1. **Create the Pane Component**:
   Create `src/plugins/builtin/my-feature/pane.tsx`:
   ```tsx
   import { Box, Text } from "../../../ui";
   import type { PaneProps } from "../../../types/plugin";

   export function MyFeaturePane({ focused, width, height }: PaneProps) {
     return (
       <Box flexDirection="column" padding={1} flexGrow={1}>
         <Text bold color="green">My Feature View</Text>
         <Text>Focused: {focused ? "Yes" : "No"}</Text>
       </Box>
     );
   }
   ```

2. **Create the Plugin Definition**:
   Create `src/plugins/builtin/my-feature/index.ts`:
   ```typescript
   import type { RazorTerminalPlugin } from "../../../types/plugin";
   import { MyFeaturePane } from "./pane";

   export const myFeaturePlugin: RazorTerminalPlugin = {
     id: "my-feature",
     name: "My Feature",
     version: "1.0.0",
     description: "Custom feature pane",
     toggleable: true,
     setup(ctx) {
       ctx.registerPane({
         id: "my-feature-pane",
         name: "My Feature",
         icon: "sparkles",
         defaultPosition: "right",
         component: (props) => <MyFeaturePane {...props} />,
       });
       ctx.registerCommand({
         id: "cmd-my-feature",
         label: "MF: Open My Feature",
         shortcut: "MF",
         execute: () => ctx.openPane("my-feature-pane"),
       });
     },
   };
   ```

3. **Register the Plugin**:
   Add `myFeaturePlugin` into the catalog in [`src/plugins/builtin/composite-plugins.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/plugins/builtin/composite-plugins.ts).

---

### Recipe 2: Adding a New Market Data Route

To route a new asset class or data endpoint:

1. Open [`src/sources/provider-router/index.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/sources/provider-router/index.ts).
2. Implement your data fetching method or plug it into `AssetDataRouter`.
3. Add a query cache store in [`src/market-data/coordinator/index.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/market-data/coordinator/index.ts).
4. Expose a custom hook in [`src/market-data/hooks.tsx`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/market-data/hooks.tsx).

---

### Recipe 3: Adding a Custom Theme

1. Open [`src/theme/themes/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/theme/) or [`src/theme/colors.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/theme/colors.ts).
2. Define the palette colors (`bg`, `fg`, `accent`, `border`, `chartGreen`, `chartRed`, `dim`).
3. Register the theme in [`src/types/config.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/types/config.ts) under the `AppTheme` enum.

---

## 7.5 Verification & Audit Checklist

Before committing or releasing modifications:

```bash
# 1. Typecheck all targets
bun run typecheck

# 2. Run unit tests
bun test

# 3. Verify bundle integrity (for web changes)
bun run web:audit

# 4. Audit translations
bun run i18n:audit
```

---

*You are now equipped with full knowledge of RazorTerminal's architecture, subsystems, and development practices!*
