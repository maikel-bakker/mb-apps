import { browserScrape } from "@mb/browser-scrape";

(async () => {
  const result = await browserScrape({
    url: "https://www.fifththirdarena.com/calendar",
    returnHtml: true,
  });

  console.log(result);
})();
