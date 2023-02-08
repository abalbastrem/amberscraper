const { selectors } = require('playwright');
const config = require('./config.js');

async function main() {
    // const highlights = await serverStart();
    // writeOut(highlights);
    parseJson();
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
    const segments = timecodes.segments;

    for (highlight of highlights) {
        const hlWords = highlight.split(' ');
        let j = 0;
        for (segment of segments) {
            for (let i = 0; i < segment.words.length; i++) {
                if (segment.words[i].text == hlWords[j]) {
                    sentence = "";
                    while (j < hlWords.length) {
                        let tcWord = segment.words[i+j].text.replace(/[^a-zA-Z0-9]/g, "");
                        let hlWord = hlWords[j].replace(/[^a-zA-Z0-9]/g, "");
                        if (hlWord == tcWord) {
                            sentence += hlWords[j] + " ";
                            if (j == 0) {
                                tcIn = segment.words[i+j].start;
                            }
                            if (j == hlWords.length - 1) {
                                tcOut = segment.words[i+j].end;
                            }
                        } else {
                            i += j
                            j = 0;
                            break;
                        }
                        j++;
                    }
                    blob = {
                        "tc_in": tcIn,
                        "tc_out": tcOut,
                        "text": sentence.trim()
                    }
                    console.log(blob);
                }
            }
        }
    }
    
}

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

        // var hlBlobArr = [];
        // let counter = 0;
        // for (hlText of highlightedTexts) {
        //     hlBlob = new Map();
        //     let hlSpan = await page.getByText(hlText); // DEBUG too generic texts sometimes!

        //     const firstId = "first_"+counter;
        //     const lastId = "last_"+counter;

        //     await hlSpan.evaluate((el, num) => {
        //         const first = document.createElement('span');
        //         first.setAttribute('id', "first_"+num);
        //         first.setAttribute('style', "background-color: rgba(0, 90, 80, 0.35)");
        //         first.setAttribute('data-text', 'true');
        //         first.innerText ="FI"+num;
        //         el.insertAdjacentElement('beforebegin', first);
        //     }, counter);

        //     await page.click("#"+firstId, {modifiers:['Alt'], timeout: 5000});
        //     const tcIn = await getTimecode(page);

        //     const hlSpanNextSibling = await hlSpan.evaluateHandle((hlSpan) => hlSpan.nextElementSibling);

        //     await hlSpanNextSibling.evaluate((el, num) => {
        //         const last = document.createElement('span');
        //         last.setAttribute('id', "last_"+num);
        //         // last.setAttribute('style', "background-color: rgba(0, 90, 80, 0.35)");
        //         last.setAttribute('style', "float: right;");
        //         last.setAttribute('data-text', 'true');
        //         last.innerText ="LT"+num;
        //         el.insertAdjacentElement('beforebegin', last);
        //     }, counter);

        //     await page.click("#"+lastId, {modifiers:['Alt'], timeout: 5000});
        //     const tcOut = await getTimecode(page);

        //     hlBlob.set("tc_in", tcIn);
        //     hlBlob.set("tc_out", tcOut);
        //     hlBlob.set("text", hlText);
        //     console.log(hlBlob);

        //     counter++;
        // }
    })();
}

async function lambda() {
    return await element.evaluate((e1) => {
        return window.getComputedStyle(e1,':after').top
     })
}

function firstNLastWords(text) {
    const textByWords = text.split(' ');
    const firstWord = textByWords[0];
    const lastWord = textByWords[textByWords.length-1];
    
    return {
        "first": firstWord,
        "last": lastWord
    }
}

async function clickOnWord(element, word) {
    return await element.evaluate((element, word) => {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(element.childNodes[0], content.indexOf(word));
        range.setStart(element.childNodes[0], content.indexOf(word) + word.length);
        selection.removeAllRanges();
        selection.addRange(range);
    }, textToClick);
}

async function altClickOutTimecode(highlightedTextElement) {
    await highlightedTextElement.focus();
    await highlightedTextElement.setSelectionRange(0, 0, "backward"); // TODO use this in a lambda?
    await page.keyboard.down('Alt');
    await highlightedTextElement.click();
    await page.keyboard.up('Alt');
    await page.waitForSelector('time');
}

async function getTimecode(page) {
    var timecodeFull = await page.locator('time').first().innerText();
    var timecode = timecodeFull.split('/')[0];
    return timecode.trim();
}

 async function hideElement(page, selector) {
    const el = await page.locator(selector);
    el.evaluate(element => element.style.display = 'none');
 }

main()
