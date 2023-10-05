// svc
import { scrape } from './svc/scraper.js';
import { format } from './svc/formatter.js';
import { createSpreadsheet } from './svc/spreadsheet.js';


async function main() {
    console.log("***** HIGHLIGHTS *****");
    const highlights = await scrape();
    console.log("***** FORMATTER *****");
    const sentences = format(highlights);
    console.log("***** SPREADSHEET *****");
    await createSpreadsheet(sentences, config.SPREADSHEET_ID, config.SPREADSHEET_NAME);
}

main();
