const config = require('./config.js');

// svc
const scrape = require('./svc/scraper.js');
const format = require('./svc/formatter.js');
const spreadsheet = require('./svc/spreadsheet.js');


async function main() {
    console.log("***** HIGHLIGHTS *****");
    const highlights = await scrape();
    console.log("***** FORMATTER *****");
    const sentences = await format(highlights);
    console.log(sentences);
    // console.log("***** SPREADSHEET *****");
    // await spreadsheet(sentences, config.SPREADSHEET_ID, config.SPREADSHEET_NAME);
}

main();
