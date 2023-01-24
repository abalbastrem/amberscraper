const { selectors } = require('playwright');
const config = require('./config.js');

function main() {
    serverStart();
}

function serverStart() {
    const playwright = require('playwright');
    (async () => {
        const browser = await playwright.firefox.launch({
            headless: true,
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
        // pseudo element ::first-letter, ::before, ::after, with lambdas?
        for (hlText of highlightedTexts) {
            hlBlob = new Map();
            console.log(hlText);
            let hlSpan = await page.getByText(hlText);

            // TODO get hlSpan inside the evaluate with JS
            const hlSpanMod = await page.evaluateHandle(
                e1 => {
                    const first = document.createElement('div');
                    const last = document.createElement('div');
                    first.setAttribute('id', 'first');
                    last.setAttribute('id', 'last');
                    e1.append(first);
                    e1.prepend(last);
                    return e1;
                }, hlSpan
            );
            // const hlSpanMod = await page.evaluate(
            //     three => {return 2 + three}, 3
            //     );
            console.log(hlSpan);
            console.log(hlSpanMod);
            // locate element by id
            const firstEl = await page.locator("#first").first();
            const lastEl = await page.locator("#last").first();

            console.log(firstEl);
            console.log(lastEl);

            await firstEl.click({modifiers:['Alt']});
            await lastEl.click({modifiers:['Alt']});

            return;
            words = firstNLastWords(hlText);
            return;
            // await hlSpan.click({modifiers:['Alt']});
            const tcIn = await getTimecode(page);
            hlBlob.set("tc_in", tcIn);
            // hlBlob.set("tc_out", tcOut);
            hlBlob.set("text", hlText);
            // console.log(hlBlob);
        }
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
