import { chromium } from "playwright";
import sanitizeHtml from "sanitize-html";

export type BrowserScrapeArgs = {
  url: string;
  waitUntil?: "domcontentloaded" | "load" | "networkidle";
  timeoutMs?: number;
  selectorToWaitFor?: string;
  returnHtml?: boolean;
  screenshot?: boolean;
};

export type BrowserScrapeResult =
  | {
      ok: true;
      url: string;
      finalUrl: string;
      title: string;
      status: number | null;
      mainText: string;
      html?: string;
      screenshotBase64?: string;
    }
  | {
      ok: false;
      url: string;
      error: string;
    };

export async function browserScrape(
  args: BrowserScrapeArgs,
): Promise<BrowserScrapeResult> {
  const url = args.url;

  const waitUntil = args.waitUntil ?? "networkidle";
  const timeoutMs = args.timeoutMs ?? 25_000;

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
    javaScriptEnabled: true,
  });

  const page = await context.newPage();

  try {
    const resp = await page.goto(url, { waitUntil, timeout: timeoutMs });

    if (args.selectorToWaitFor) {
      await page.waitForSelector(args.selectorToWaitFor, {
        timeout: timeoutMs,
      });
    }

    const title = await page.title();
    const mainTextRaw = await page.evaluate(
      () => document.body?.innerText ?? "",
    );

    let html: string | undefined;
    if (args.returnHtml) {
      html = await page.content();
    }

    let screenshotBase64: string | undefined;
    if (args.screenshot) {
      const buf = await page.screenshot({ fullPage: true });
      screenshotBase64 = buf.toString("base64");
    }

    const sanitizedHTml = html ? sanitizeHtml(html) : "";
    const removedWhiteSpaceHtml = sanitizedHTml.replace(/>\s+</g, "><").trim();

    return {
      ok: true,
      url: url,
      finalUrl: page.url(),
      title,
      status: resp?.status() ?? null,
      mainText: mainTextRaw,
      html: removedWhiteSpaceHtml,
      screenshotBase64,
    };
  } catch (e: any) {
    return { ok: false, url: url, error: e?.message ?? String(e) };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + "\n...[truncated]" : s;
}
