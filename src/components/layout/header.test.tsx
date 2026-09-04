import { afterEach, expect, test } from "bun:test";
import { testRender } from "../../renderers/opentui/test-utils";
import { AppContext, createInitialState } from "../../state/app/context";
import { createDefaultConfig } from "../../types/config";
import { VERSION } from "../../version";
import { act, type ReactNode } from "react";
import { UiHostProvider, useNativeRenderer, useRendererHost, useUiHost } from "../../ui";
import { Header } from "./header";

let testSetup: Awaited<ReturnType<typeof testRender>> | undefined;

afterEach(() => {
  testSetup?.renderer.destroy();
  testSetup = undefined;
});

test("opens the current version changelog from the header", async () => {
  let openedVersion = "";
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-test"));
  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <Header onOpenChangelog={(version) => { openedVersion = version; }} />
    </AppContext>,
    { width: 100, height: 1 },
  );

  await testSetup.renderOnce();
  const versionX = testSetup.captureCharFrame().indexOf(`v${VERSION}`);
  expect(versionX).toBeGreaterThanOrEqual(0);

  await act(async () => {
    await testSetup!.mockMouse.click(versionX + 1, 0);
    await testSetup!.renderOnce();
  });
  expect(openedVersion).toBe(VERSION);
});

test("renders clean corporate finance header without stock ticker or market state", async () => {
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-purity-test"));
  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <Header />
    </AppContext>,
    { width: 120, height: 1 },
  );

  await act(async () => {
    await testSetup!.renderOnce();
  });
  const frame = testSetup.captureCharFrame();

  expect(frame).toContain("RazorTerminal");
  expect(frame).toContain(`v${VERSION}`);
  expect(frame).toContain("INR");

  // Verify stock market indicators are completely absent
  expect(frame).not.toContain("SPY");
  expect(frame).not.toContain("Market Open");
  expect(frame).not.toContain("Market Closed");
  expect(frame).not.toContain("Post-Mkt");
  expect(frame).not.toContain("Pre-Mkt");
});

test("renders cleanly under constrained terminal width without pushing INR out", async () => {
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-narrow-test"));
  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <Header />
    </AppContext>,
    { width: 40, height: 1 },
  );

  await act(async () => {
    await testSetup!.renderOnce();
  });
  const frame = testSetup.captureCharFrame();

  expect(frame).toContain("RazorTerminal");
  expect(frame).toContain("INR");
});

test("renders cleanly under constrained width when update notice is active", async () => {
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-notice-test"));
  (state as any).updateNotice = "v1.2.0 available — run razor upgrade to install";
  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <Header />
    </AppContext>,
    { width: 40, height: 1 },
  );

  await act(async () => {
    await testSetup!.renderOnce();
  });
  const frame = testSetup.captureCharFrame();
  expect(frame).toContain("RazorTerminal");
  expect(frame).toContain("INR");
});

function OverlayWrapper({ children }: { children: ReactNode }) {
  const ui = useUiHost();
  const renderer = useRendererHost();
  const nativeRenderer = useNativeRenderer();
  const overlayUi = {
    ...ui,
    capabilities: {
      ...ui.capabilities,
      titleBarOverlay: true,
    },
  };
  return (
    <UiHostProvider ui={overlayUi} renderer={renderer} nativeRenderer={nativeRenderer}>
      {children}
    </UiHostProvider>
  );
}

test("renders clean titlebar overlay without stock ticker or market state", async () => {
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-overlay-test"));
  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <OverlayWrapper>
        <Header />
      </OverlayWrapper>
    </AppContext>,
    { width: 120, height: 1 },
  );

  await act(async () => {
    await testSetup!.renderOnce();
  });
  const frame = testSetup.captureCharFrame();

  expect(frame).toContain("RazorTerminal");
  expect(frame).toContain(`v${VERSION}`);
  expect(frame).toContain("INR");

  // Verify stock market indicators are completely absent
  expect(frame).not.toContain("SPY");
  expect(frame).not.toContain("Market Open");
  expect(frame).not.toContain("Market Closed");
  expect(frame).not.toContain("Post-Mkt");
  expect(frame).not.toContain("Pre-Mkt");
});

test("renders clean titlebar overlay under constrained width with update notice", async () => {
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-overlay-narrow-test"));
  (state as any).updateNotice = "v1.2.0 available — run razor upgrade to install";
  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <OverlayWrapper>
        <Header />
      </OverlayWrapper>
    </AppContext>,
    { width: 50, height: 1 },
  );

  await act(async () => {
    await testSetup!.renderOnce();
  });
  const frame = testSetup.captureCharFrame();

  expect(frame).toContain("RazorTerminal");
  expect(frame).toContain("INR");
  expect(frame).not.toContain("SPY");
});

test("renders titlebar overlay with help action cleanly", async () => {
  let helpOpened = false;
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-help-test"));

  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <OverlayWrapper>
        <Header onOpenHelp={() => { helpOpened = true; }} />
      </OverlayWrapper>
    </AppContext>,
    { width: 120, height: 1 },
  );

  await act(async () => {
    await testSetup!.renderOnce();
  });
  const frame = testSetup.captureCharFrame();

  expect(frame).toContain("RazorTerminal");
  expect(frame).toContain("Help");
  expect(frame).toContain("INR");
  expect(frame).not.toContain("SPY");
  expect(frame).not.toContain("Market Open");

  const helpX = frame.indexOf("Help");
  expect(helpX).toBeGreaterThanOrEqual(0);
  await act(async () => {
    await testSetup!.mockMouse.click(helpX + 1, 0);
    await testSetup!.renderOnce();
  });
  expect(helpOpened).toBe(true);
});

test("opens changelog from desktop titlebar overlay", async () => {
  let openedVersion = "";
  const state = createInitialState(createDefaultConfig("/tmp/gloomberb-header-overlay-changelog-test"));
  testSetup = await testRender(
    <AppContext value={{ state, dispatch: () => {} }}>
      <OverlayWrapper>
        <Header onOpenChangelog={(version) => { openedVersion = version; }} />
      </OverlayWrapper>
    </AppContext>,
    { width: 120, height: 1 },
  );

  await testSetup.renderOnce();
  const versionX = testSetup.captureCharFrame().indexOf(`v${VERSION}`);
  expect(versionX).toBeGreaterThanOrEqual(0);

  await act(async () => {
    await testSetup!.mockMouse.click(versionX + 1, 0);
    await testSetup!.renderOnce();
  });
  expect(openedVersion).toBe(VERSION);
});



