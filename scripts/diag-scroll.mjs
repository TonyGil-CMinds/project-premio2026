import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9345;

await mkdir(`C:/tmp/premio-diag-${port}`, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=C:/tmp/premio-diag-${port}`,
  "--window-size=1728,1117",
  "about:blank",
]);

let id = 0;
const pending = new Map();

async function getWs() {
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("http://127.0.0.1:3000")}`);
      const targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json());
      const page = targets.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { await sleep(150); }
  }
  throw new Error("Chrome did not start");
}

const ws = new WebSocket(await getWs());

function send(method, params = {}) {
  const mid = ++id;
  ws.send(JSON.stringify({ id: mid, method, params }));
  return new Promise((res, rej) => pending.set(mid, { resolve: res, reject: rej }));
}

ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});

await new Promise((r) => ws.addEventListener("open", r, { once: true }));
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1728, height: 1117, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://127.0.0.1:3000" });
await sleep(4000);

const ev = (expr) => send("Runtime.evaluate", { expression: expr, returnByValue: true }).then(r => r.result.value);

console.log("hasLenis:", await ev("String(!!window.__lenis)"));
console.log("scrollY before:", await ev("String(window.scrollY)"));
console.log("bodyScrollHeight:", await ev("String(document.body.scrollHeight)"));
console.log("afterHeroExists:", await ev('String(!!document.querySelector(".after-hero"))'));
console.log("hasErrorOverlay:", await ev('String(!!document.querySelector("[data-nextjs-dialog]"))'));
console.log("subjectVisible:", await ev('(() => { const el = document.querySelector(".ah-subject"); return el ? el.style.opacity + " / " + el.style.visibility : "null"; })()'));

await send("Runtime.evaluate", {
  expression: "window.__lenis ? window.__lenis.scrollTo(2800, { immediate: true }) : window.scrollTo(0, 2800)",
  returnByValue: true,
});

await sleep(500);
console.log("scrollY after 500ms:", await ev("String(window.scrollY)"));

await sleep(2000);
console.log("scrollY after 2500ms:", await ev("String(window.scrollY)"));
console.log("subjectOpacity after:", await ev('(() => { const el = document.querySelector(".ah-subject"); if (!el) return "null"; const s = window.getComputedStyle(el); return "opacity=" + s.opacity + " visibility=" + s.visibility + " transform=" + el.style.transform; })()'));
console.log("elem1 opacity:", await ev('(() => { const el = document.querySelector(".ah-elem-1"); if (!el) return "null"; return window.getComputedStyle(el).opacity; })()'));

// Bounding rects
console.log("stage rect:", await ev('(() => { const el = document.querySelector(".ah-stage"); if (!el) return "null"; const r = el.getBoundingClientRect(); return JSON.stringify({top:Math.round(r.top),left:Math.round(r.left),bottom:Math.round(r.bottom),right:Math.round(r.right),w:Math.round(r.width),h:Math.round(r.height)}); })()'));
console.log("subject rect:", await ev('(() => { const el = document.querySelector(".ah-subject"); if (!el) return "null"; const r = el.getBoundingClientRect(); return JSON.stringify({top:Math.round(r.top),left:Math.round(r.left),bottom:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}); })()'));
console.log("elem1 rect:", await ev('(() => { const el = document.querySelector(".ah-elem-1"); if (!el) return "null"; const r = el.getBoundingClientRect(); return JSON.stringify({top:Math.round(r.top),left:Math.round(r.left),bottom:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}); })()'));
console.log("scrollY final:", await ev("String(window.scrollY)"));
console.log("after-hero rect:", await ev('(() => { const el = document.querySelector(".after-hero"); if (!el) return "null"; const r = el.getBoundingClientRect(); return JSON.stringify({top:Math.round(r.top),bottom:Math.round(r.bottom),h:Math.round(r.height)}); })()'))

ws.close();
chrome.kill();
