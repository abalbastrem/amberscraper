const config = require('./config.js');

// svc
const scrape = require('./svc/scraper.js');
const {Write, Read} = require('./svc/formatter.js');
const spreadsheet = require('./svc/spreadsheet.js');


async function main() {
    console.log("***** HIGHLIGHTS *****");
    const highlights = await scrape();
    console.log("***** FORMATTER *****");
    await Write(highlights);
    sentences = await Read();
    const sentences = format(highlights);
    console.log("***** SPREADSHEET *****");
    await spreadsheet(sentences, config.SPREADSHEET_ID, config.SPREADSHEET_NAME);
}

main();
