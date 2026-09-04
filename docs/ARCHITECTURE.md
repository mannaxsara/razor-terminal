# 2. Deep Architecture & Renderers

## 2.1 The Renderer-Neutral UI Abstraction Layer

A core architectural principle in RazorTerminal is **strict separation between UI component definitions and platform renderers**. Panes, tabs, dialogs, and components in [`src/plugins/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/plugins/) and [`src/components/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/components/) **never** import OpenTUI, Electrobun, or raw DOM primitives directly. Instead, they import cross-platform primitives from [`src/ui/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/ui/).

```
                +------------------------------------+
                |   Plugins & Shared UI Components   |
                |  (<Box>, <Text>, <ChartSurface>)   |
                +-----------------+------------------+
                                  |
                                  v
                +------------------------------------+
                |       UiHost Context Interface     |
                |         (src/ui/host.tsx)          |
                +-----------------+------------------+
                                  |
         +------------------------+------------------------+
         |                        |                        |
         v                        v                        v
+-----------------+      +-----------------+      +-----------------+
|     OpenTUI     |      |   Electrobun    |      |   Browser DOM   |
| Terminal Host   |      |  Desktop Host   |      |    Web Host     |
| (ANSI / Kitty)  |      |  (DOM + IPC)    |      | (DOM + Storage) |
+-----------------+      +-----------------+      +-----------------+
```

### The `UiHost` Contract

The [`UiHost`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/ui/host.tsx) interface provides the fundamental UI elements:

| Component | Responsibility across Platforms |
| :--- | :--- |
| `<Box>` | Flexbox container. In OpenTUI, calculates terminal cell bounds via Yoga-like layout; in DOM, maps to `<div>` with flexbox/grid CSS. |
| `<Text>` | Typography element supporting styling, bold, colors, and syntax highlighting. |
| `<ChartSurface>` | Renders financial charts. Uses Kitty graphics protocol or Braille/half-block in terminal; renders HTML5 `<canvas>` / SVG in desktop and browser. |
| `<ImageSurface>` | Displays logos and imagery. Uses terminal graphics protocols in TUI; renders `<img>` / canvas in DOM. |
| `<MediaSurface>` | Video player for live financial TV. Launches headless `mpv` with Kitty video output in TUI; uses `<video>` / `hls.js` in DOM. |
| `<DialogHost>` | Modal dialog overlay system. In TUI, paints framed floating boxes; in DOM, paints accessible backdrop modals. |
| `<ToastHost>` | Ephemeral notification banners positioned at the bottom/top of the screen. |
| `<ContextMenu>` | Native popup menus. In Electrobun, triggers native OS context menus; in TUI/Browser, renders floating overlay menus. |

### Remote Semantic Tree

Every interactive primitive (`Box`, `Text`, `Input`) hooks into [`useRemoteUiNode`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/remote/semantic-tree.tsx). This constructs a synchronized, headless semantic tree of the entire UI, allowing automated testing, CLI screenshots (`razor-terminal shot`), and external WebSocket control (`src/remote/server.ts`).

---

## 2.2 Terminal UI Engine: OpenTUI

The Terminal renderer ([`src/renderers/opentui/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/opentui/)) renders React 19 component trees to the terminal buffer via `@opentui/core`.

### Key Components:
- **`start.tsx`** ([`src/renderers/opentui/start.tsx`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/opentui/start.tsx)): Bootstraps the terminal host, intercepts console logging to prevent corruption of the TUI display, starts the remote control server, and mounts the React root.
- **`host.tsx`** ([`src/renderers/opentui/host.tsx`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/opentui/host.tsx)): Implements the terminal layout engine, mouse event processing, cursor positioning, and focus management.
- **`chart-surface.tsx`** ([`src/renderers/opentui/chart-surface.tsx`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/opentui/chart-surface.tsx)): High-performance terminal chart renderer. Detects Kitty terminal graphics support for raster rendering, falling back to Unicode Braille patterns (`\u2800`–`\u28FF`) and half-blocks (`▀`, `▄`).
- **`terminal-media.ts`** ([`src/renderers/opentui/terminal-media.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/opentui/terminal-media.ts)): Manages terminal video streaming via `mpv`.

### OpenTUI Guidelines (from `AGENTS.md`):
1. **Never disable Kitty renderer**: Always fix the root cause rather than falling back to low-res rendering.
2. **Dynamic Footers**: Pane footers must only show state that changes (loading, error, delayed, stale, auth state), never static labels or row counts.
3. **Information Density**: Never repeat the same title in a pane header and the pane body.

---

## 2.3 Desktop Application Engine: Electrobun

The Desktop application ([`src/renderers/electrobun/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/electrobun/)) uses Electrobun to deliver a lightweight native desktop experience.

### Process Model:

```
+-------------------------------------------------------------------+
| Bun Backend Process (src/renderers/electrobun/bun/)                |
|  - SQLite Database & Local File System Access                     |
|  - Real IBKR Native TCP Socket / C++ Addon Interop                |
|  - OS Window Creation & Native Detached Window Lifecycles         |
|  - Background Update Downloader & Installer                      |
+---------------------------------+---------------------------------+
                                  |
                     Bi-directional JSON-RPC
                     (BackendRpcClient / IPC)
                                  |
+---------------------------------v---------------------------------+
| WebView UI Process (src/renderers/electrobun/view/)               |
|  - React 19 DOM Renderer & CSS Styling                            |
|  - DOM Canvas Charts & Smooth 60fps Scrolling                     |
|  - Native OS Context Menus & Application Menu Bridge              |
|  - Detached Pane Shells & Pop-out Windows                         |
+-------------------------------------------------------------------+
```

### Key Modules:
- **`backend-rpc.ts`** ([`src/renderers/electrobun/view/backend-rpc.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/electrobun/view/backend-rpc.ts)): Handles asynchronous RPC between the UI WebView and the Bun backend process.
- **`desktop/`** ([`src/renderers/electrobun/bun/desktop-windows.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/electrobun/bun/desktop-windows.ts)): Manages native OS windows, including pop-out floating panes (`DetachedPaneShell`) that run in synchronized secondary WebViews.
- **`dom-ui-host.tsx`** ([`src/renderers/electrobun/view/dom-ui-host.tsx`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/electrobun/view/dom-ui-host.tsx)): Implements `UiHost` using real DOM, CSS grid/flexbox, HTML5 canvas, and pointer events.

---

## 2.4 Browser Web App & Cloudflare Workers

The Web application ([`src/renderers/browser/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/browser/) & [`src/renderers/cloudflare/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/cloudflare/)) enables zero-install access via web browsers.

### Key Architectural Boundaries:
- **`storage.ts`** ([`src/renderers/browser/storage.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/browser/storage.ts)): Uses browser `localStorage` as the backing store instead of SQLite.
- **`cloud-transport.ts`** ([`src/renderers/browser/cloud-transport.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/renderers/browser/cloud-transport.ts)): Directs all REST and WebSocket calls through `/api` endpoints forwarded by the Cloudflare Worker to `https://api.gloom.sh`.
- **Security Boundaries**: Intentionally excludes native desktop features (e.g. native broker credentials, filesystem notes, and arbitrary external plugins) to ensure browser security.

---

## 2.5 App Core & Service Ports

RazorTerminal uses a **Ports and Adapters (Hexagonal)** architecture inside [`src/core/`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/core/):

- **[`src/core/app-service-ports.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/core/app-service-ports.ts)** defines abstract interfaces:
  - `AppTickerRepositoryPort`: Managing active watchlist and portfolio tickers.
  - `AppResourceStorePort`: Key-value storage for plugin configurations.
  - `AppServicesFactory`: Factory interface for bootstrapping services across platforms.
- **[`src/core/app-services.ts`](file:///c:/Users/patil/OneDrive/Desktop/zzz/src/core/app-services.ts)** instantiates the concrete runtime container (`AppServices`):
  ```typescript
  export interface AppServices {
    persistence: AppPersistence;
    tickerRepository: TickerRepository;
    providerRouter: AssetDataRouter;
    dataProvider: DataProvider;
    marketData: MarketDataCoordinator;
    pluginRegistry: PluginRegistry;
    newsService: NewsService;
    ready: Promise<void>;
    destroy(): void;
  }
  ```

---

*Next: Read [**3. Market Data & Feeds**](./MARKET_DATA_SYSTEM.md) to explore how financial data is ingested, coordinated, and cached.*
