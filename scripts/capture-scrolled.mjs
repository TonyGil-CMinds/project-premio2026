import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const width = Number(process.argv[2] ?? 1728);
const height = Number(process.argv[3] ?? 1117);
const scrollY = Number(process.argv[4] ?? 1200);
const output = process.argv[5] ?? "premio-scrolled.png";
const port = Number(process.argv[6] ?? 9340);

await mkdir(`C:\\tmp\\premio-scroll-${port}`, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=C:\\tmp\\premio-scroll-${port}`,
  `--window-size=${width},${height}`,
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
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
await send("Page.navigate", { url: "http://127.0.0.1:3000" });
await sleep(8000);

// Scroll via Lenis (immediate, no lerp) so ScrollTrigger updates synchronously.
// Falls back to window.scrollTo if __lenis isn't available yet.
await send("Runtime.evaluate", {
  expression: `
    if (window.__lenis) {
      window.__lenis.scrollTo(${scrollY}, { immediate: true });
    } else {
      window.scrollTo(0, ${scrollY});
    }
  `,
  returnByValue: true,
});
// Give Lenis one rAF to process the immediate scroll, then force ST update
await sleep(100);
await send("Runtime.evaluate", {
  expression: `
    window.scrollTo(0, ${scrollY});
    window.dispatchEvent(new Event('scroll'));
  `,
  returnByValue: true,
});
// Wait for GSAP scrub (scrub:1.2 = 1.2s catch-up) + settle
await sleep(2500);

const ss = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
await writeFile(output, Buffer.from(ss.data, "base64"));
console.log(JSON.stringify({ output, scrollY }));

ws.close();
chrome.kill();
