/**
 * Persist the last-used {contentType, fields, design} in storage.local
 * (never storage.sync — "no data leaves the browser" stays literally
 * true). Saves are debounced; failures are swallowed (private-browsing
 * quirks must never break the popup).
 */
import { ext } from "../compat";
import type { ContentType } from "../shared/qr-encoders";
import type { DesignConfig } from "../shared/types";

export type PersistedState = {
  contentType: ContentType;
  /** Per-type field values, so switching types keeps each form's input. */
  fields: Partial<Record<ContentType, Record<string, string>>>;
  design: DesignConfig;
  /** Active preset id, or null after manual color edits. */
  presetId: string | null;
};

const KEY = "qrcow.popup.v1";
let saveTimer: ReturnType<typeof setTimeout> | undefined;

export async function loadState(): Promise<PersistedState | null> {
  try {
    const got = await ext.storage.local.get(KEY);
    return (got?.[KEY] as PersistedState) ?? null;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    ext.storage.local.set({ [KEY]: state }).catch(() => {
      /* quota/private-mode failures are non-fatal */
    });
  }, 250);
}
