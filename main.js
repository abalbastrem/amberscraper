const { selectors } = require('playwright');
const config = require('./config.js');

function main() {
    serverStart();
}

function serverStart() {
    const playwright = require('playwright');
    (async () => {
        const browser = await playwright.firefox.launch({
            headless: false,
            // args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto(config.URL_LOGIN);
        await page.type('input[placeholder="Email"]', config.USER_EMAIL);
        await page.type('input[placeholder="Password"]', config.USER_PASSWORD);
        await page.click('button[data-testid="login-btn-login"]');
        await page.waitForNavigation();

        await page.goto(config.URL_VIDEO, { waitUntil: 'domcontentloaded', timeout: 0 });
        await page.waitForNavigation();
        page.waitForSelector('div[class="WavePlayer__highlight"]');
        await page.waitForSelector('button[data-type="close"]');
        await page.click('button[data-type="close"]');

        await hideElement(page, 'footer[class="footer_main"]');
        await hideElement(page, 'div[class="WavePlayer__mediawrap isVideo isExpanded"]');
        await hideElement(page, 'header[class="AppBar"]');
        

        const highlightedTexts = await page.locator('span[style="background-color: rgba(0, 90, 80, 0.35);"] > span').allInnerTexts();
        var hlBlobArr = [];
        for (hlText of highlightedTexts) {
            hlBlob = new Map();
            hlSpan = await page.getByText(hlText);
            // click in the first word of hlSpan
            words = firstNLastWords(hlText);
            console.log(hlText);
            console.log(words);
            await hlSpan.click({modifiers:['Alt']});
            const tcIn = await getTimecode(page);
            hlBlob.set("tc_in", tcIn);
            // hlBlob.set("tc_out", tcOut);
            hlBlob.set("text", hlText);
            // console.log(hlBlob);
        }
    })();
}

async function firstNLastWords(text) {
    const textByWords = text.split(' ');
    const firstWord = textByWords[0];
    const lastWord = textByWords[textByWords.length-1];
    
    return {
        "first": firstWord,
        "last": lastWord
    }
}

async function clickOnWord(element, word) {
    await element.evaluate((element, word) => {
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
    await highlightedTextElement.setSelectionRange(0, 0, "backward");
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
