/**
 * Event page: registers the three context-menu items and opens the popup
 * page in a small popup-type window when one is clicked.
 *
 * Prefill flows through QUERY PARAMS (stateless — no background↔popup
 * races, survives a window reload). Selections are truncated to 4000
 * chars, matching STUDIO_LIMITS.text and the text encoder's own cap.
 *
 * NOTE: keep this file DOM-free. Firefox MV3 event pages do have a
 * document today, but a future Chrome port runs this as a service
 * worker, which does not.
 */

import { ext, menus } from "./compat";

const MENU_ITEMS: { id: string; titleKey: string; contexts: browser.menus.ContextType[] }[] = [
  { id: "qr-page", titleKey: "menuPage", contexts: ["page"] },
  { id: "qr-link", titleKey: "menuLink", contexts: ["link"] },
  { id: "qr-selection", titleKey: "menuSelection", contexts: ["selection"] },
];

ext.runtime.onInstalled.addListener(() => {
  for (const item of MENU_ITEMS) {
    menus.create({
      id: item.id,
      title: ext.i18n.getMessage(item.titleKey),
      contexts: item.contexts,
    });
  }
});

menus.onClicked.addListener(async (info) => {
  const p = new URLSearchParams({ mode: "window" });
  if (info.menuItemId === "qr-page") {
    p.set("type", "url");
    p.set("url", info.pageUrl ?? "");
  } else if (info.menuItemId === "qr-link") {
    p.set("type", "url");
    p.set("url", info.linkUrl ?? "");
  } else if (info.menuItemId === "qr-selection") {
    p.set("type", "text");
    p.set("text", (info.selectionText ?? "").slice(0, 4000));
  } else {
    return;
  }
  const url = ext.runtime.getURL(`popup/popup.html?${p.toString()}`);
  try {
    await ext.windows.create({ url, type: "popup", width: 400, height: 660 });
  } catch {
    // Some environments (e.g. certain kiosk setups) refuse popup windows.
    await ext.tabs.create({ url });
  }
});
