/**
 * One bundle, two browsers.
 *
 * Firefox ships the promise-based `browser.*` namespace; Chrome ships
 * `chrome.*` only. Chrome MV3 APIs return promises when called without a
 * callback (everything we use: tabs.query/create, windows.create,
 * storage.local get/set), so aliasing the namespace is sufficient — no
 * webextension-polyfill needed.
 *
 * The one API-name difference: Firefox `menus` vs Chrome `contextMenus`
 * (create() is sync-ish + optional-callback in BOTH, never awaited here).
 */
type ExtGlobal = typeof browser & { contextMenus?: typeof browser.menus };

const g = globalThis as { browser?: ExtGlobal; chrome?: ExtGlobal };

export const ext: ExtGlobal = g.browser ?? (g.chrome as ExtGlobal);

export const menus: typeof browser.menus =
  ext.menus ?? (ext.contextMenus as typeof browser.menus);
