const config = require('./config.js');

// svc
const scrape = require('./svc/scraper.js');
// const {Write, Read} = require('./svc/formatter.js');
import {Read} from './svc/formatter.js';
const spreadsheet = require('./svc/spreadsheet.js');


async function main() {
    console.log("***** HIGHLIGHTS *****");
    const highlights = await scrape();
    console.log(highlights);
    console.log("***** FORMATTER *****");
    // await Write(highlights);
    sentences = await Read(highlights);
    // const sentences = await format(highlights);
    // console.log("***** SPREADSHEET *****");
    // await spreadsheet(sentences, config.SPREADSHEET_ID, config.SPREADSHEET_NAME);
}

main();
