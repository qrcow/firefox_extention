/**
 * QR preview + export. Ports the battle-tested patterns from
 * apps/web/components/qr-studio/PreviewCanvas.tsx:
 *  - uniquifySvgIds: qr-code-styling emits non-unique <clipPath> ids
 *    ("clip-path-dot-color") — suffix them per render so nothing can
 *    ever collide (load-bearing if a second QR is ever shown).
 *  - viewBox patch: the lib emits width/height but no viewBox, so a
 *    CSS-scaled SVG crops modules.
 *  - Exports build a FRESH QRCodeStyling at the target size and use
 *    getRawData(format) — never resize the preview instance.
 */
import QRCodeStyling from "qr-code-styling";
import { buildStyleOptions } from "../shared/buildStyleOptions";
import type { DesignConfig } from "../shared/types";

const PREVIEW_SIZE = 180;
const EXPORT_SIZE = 1000;

/**
 * Verbatim port of apps/web PreviewCanvas.uniquifySvgIds: STABLE uid (the
 * `--${uid}` endsWith guard makes re-runs idempotent) and a bounded-regex
 * rewrite over every attribute so no reference form is missed. Deviating
 * from this exact logic reintroduces the solid-black-square bug.
 */
function uniquifySvgIds(host: HTMLElement | null, uid: string): void {
  const svg = host?.querySelector("svg");
  if (!svg) return;
  const ids = new Set<string>();
  svg.querySelectorAll<SVGElement>("[id]").forEach((el) => ids.add(el.id));
  ids.forEach((old) => {
    if (old.endsWith(`--${uid}`)) return; // already scoped this render
    const neu = `${old}--${uid}`;
    const el = svg.querySelector<SVGElement>(`[id="${CSS.escape(old)}"]`);
    if (el) el.id = neu;
    const re = new RegExp(`#${old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`, "g");
    svg.querySelectorAll("*").forEach((ref) => {
      for (const attr of Array.from(ref.attributes)) {
        if (attr.value.includes(`#${old}`)) {
          const next = attr.value.replace(re, `#${neu}`);
          if (next !== attr.value) ref.setAttribute(attr.name, next);
        }
      }
    });
  });
}

function patchViewBox(host: HTMLElement): void {
  const svg = host.querySelector("svg");
  if (svg && !svg.getAttribute("viewBox")) {
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }
}

let instance: QRCodeStyling | null = null;
let renderSeq = 0;

/** Render (or re-render) the preview into `host`. */
export function renderPreview(host: HTMLElement, data: string, design: DesignConfig): void {
  const opts = {
    ...buildStyleOptions(data, design),
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
  } as ConstructorParameters<typeof QRCodeStyling>[0];
  if (!instance) {
    instance = new QRCodeStyling(opts);
    instance.append(host);
  } else {
    instance.update(opts);
  }
  // qr-code-styling renders asynchronously after update(); patch on the
  // next frame AND once more shortly after — both passes are idempotent
  // (stable uid + endsWith guard), the second catches late DOM writes.
  const seq = ++renderSeq;
  const patch = () => {
    if (seq !== renderSeq) return;
    patchViewBox(host);
    uniquifySvgIds(host, "ext");
  };
  requestAnimationFrame(patch);
  setTimeout(patch, 150);
}

export function clearPreview(host: HTMLElement): void {
  instance = null;
  host.textContent = "";
}

/** Render at export size and return the bytes. */
export async function renderBlob(
  data: string,
  design: DesignConfig,
  format: "png" | "svg",
): Promise<Blob | null> {
  const opts = {
    ...buildStyleOptions(data, design),
    width: EXPORT_SIZE,
    height: EXPORT_SIZE,
    type: format === "svg" ? "svg" : "canvas",
  } as ConstructorParameters<typeof QRCodeStyling>[0];
  const qr = new QRCodeStyling(opts);
  const raw = await qr.getRawData(format);
  return raw instanceof Blob ? raw : raw ? new Blob([raw as unknown as BlobPart]) : null;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
