const { selectors } = require('playwright');
const config = require('./config.js');
const spreadsheet = require('./spreadsheet.js');


async function main() {
    // const highlights = await serverStart();
    // writeOut(highlights);
    const sentences = parseJson();
    createSpreadsheet(sentences);
    spreadsheet.Do(sentences, config.SPREADSHEET_ID, config.SPREADSHEET_NAME);
}

main();

async function serverStart() {
    const playwright = require('playwright');
    return (async () => {
        const browser = await playwright.firefox.launch({
            headless: false,
            // args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log("start");
        const context = await browser.newContext();
        const page = await context.newPage();

        console.log("login page");
        await page.goto(config.URL_LOGIN);
        await page.type('input[placeholder="Email"]', config.USER_EMAIL);
        await page.type('input[placeholder="Password"]', config.USER_PASSWORD);
        await page.click('button[data-testid="login-btn-login"]');
        await page.waitForNavigation();

        console.log("video page");
        await page.goto(config.URL_VIDEO, { waitUntil: 'domcontentloaded', timeout: 0 });
        await page.waitForNavigation();
        page.waitForSelector('div[class="WavePlayer__highlight"]');
        await page.waitForSelector('button[data-type="close"]');
        await page.click('button[data-type="close"]');

        console.log("hide annoying elements");
        await hideElement(page, 'footer[class="footer_main"]');
        await hideElement(page, 'div[class="WavePlayer__mediawrap isVideo isExpanded"]');
        await hideElement(page, 'header[class="AppBar"]');
        
        console.log("locate highlighted texts");
        const highlightedTexts = await page.locator('span[style="background-color: rgba(0, 90, 80, 0.35);"] > span').allInnerTexts();

        return highlightedTexts;
    })();
}

async function hideElement(page, selector) {
    const el = await page.locator(selector);
    el.evaluate(element => element.style.display = 'none');
 }

function writeOut(highlights) {
    const fs = require('fs');
    const json = JSON.stringify(highlights);
    fs.writeFile('highlights.json', json, 'utf8', (err) => {
        if (err) {
            console.log("Error writing file", err);
        } else {
            console.log("Successfully wrote file");
        }
    });
}

function parseJson() {
    const highlights = require('./highlights.json');
    const timecodes = require('./gabriel_araunjo.json');
    const speakers = timecodes.speakers;
    const segments = timecodes.segments;
    const videofile = timecodes.filename;
    let tcWords = []

    let speakerMap = new Map();
    for (speaker of speakers) {
        speakerMap.set(speaker.spkid, speaker.name);
    }

    const regex = /[^a-zA-Z0-9áéíóúàèìòùüÁÉÍÓÚÀÈÌÒÙÜ]/g;

    // flattens timecodes into single array of objects
    for (segment of segments) {
        for (word of segment.words) {
            tcWords.push({
                "raw": word.text,
                "text": word.text.replace(regex, ""),
                "in": word.start,
                "out": word.end,
                "speaker": speakerMap.get(segment.speaker)
            })
        }
    }

    // flattens highlights into single array of strings
    let hlWords = [];
    for (highlight of highlights) {
        highlightSplit = highlight.split(' ');
        // iterate through each word in highlight with index
        for (let i = 0; i < highlightSplit.length; i++) {
            hlWord = {
                "raw": highlightSplit[i],
                "text": highlightSplit[i].replace(regex, ""),
                "start": false,
                "end": false
            }
            if (!hlWord.text) {
                continue;
            }
            if (i == 0) {
                hlWord.start = true;
            } else if (i == highlightSplit.length - 1) {
                hlWord.end = true;
            }
        hlWords.push(hlWord);
        }
    }

    // iterate though tcWords and hlWords to find matches
    let completeWords = [];
    let i = 0;
    let j = 0;
    while (i < tcWords.length) {
        if (tcWords[i].text == hlWords[j].text) {
            word = hlWords[j];
            word.speaker = tcWords[i].speaker;
            word.in = tcWords[i].in;
            word.out = tcWords[i].out;
            completeWords.push(word);
            i++;
            j++;
        } else {
            i++;
        }
    }

    if (hlWords.length != completeWords.length) {
        console.log("ERROR: hlWords and completeWords are not the same length");
        console.log("TCwords:\t" + tcWords.length);
        console.log("HLwords:\t" + hlWords.length);
        console.log("CompleteWords:\t" + completeWords.length);
        return;
    }

    // build sentences with speaker and timecodes
    sentences = [];
    quote = "";
    for (completeWord of completeWords) {
        if (completeWord.start) {
            quote = completeWord.raw + " ";
            tcIn = completeWord.in;
            speaker = completeWord.speaker;
        } else if (!completeWord.start && !completeWord.end) {
            quote += completeWord.raw + " ";
        } else if (completeWord.end) {
            quote += completeWord.raw;
            tcOut = completeWord.out;
            sentences.push({
                "quote": quote,
                "speaker": speaker,
                "in": tcIn,
                "out": tcOut
            });
        } 
    }

    console.log(sentences);
    return sentences;
}
