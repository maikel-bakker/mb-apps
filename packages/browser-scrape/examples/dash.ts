import { browserScrape } from "../src/scrape";

(async () => {
  const result = await browserScrape({
    url: "https://apps.daysmartrecreation.com/dash/x/#/online/blackhawks/event-registration?date=2026-02-16&",
    returnHtml: true,
  });

  console.log(result);
})();
