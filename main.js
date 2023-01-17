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
        page.waitForNavigation();
        await page.waitForSelector('div[class="WavePlayer__highlight"]'); // does not work
        await page.waitForSelector('button[data-type="close"]');
        await page.click('button[data-type="close"]');

        await hideElement(page, 'footer[class="footer_main"]');
        await hideElement(page, 'div[class="WavePlayer__mediawrap isVideo isExpanded"]');
        await hideElement(page, 'header[class="AppBar"]');
        

        const highlightedSpans = await page.locator('span[style="background-color: rgba(0, 90, 80, 0.35);"] > span').all();
        var hlTextArr = [];
        for await (const hlSpan of highlightedSpans) {
            hlText = await hlSpan.innerText();
            console.log(hlText);
            await hlSpan.click({modifiers:['Alt']});

            // await altClickInTimecode(page, highlightedTextElement);
            // let tcIn = await getTimecode(page);
            // await altClickOutTimecode(page, highlightedTextElement);
            // let tcOut = await getTimecode(page);
        }
    })();
}

async function altClickInTimecode(page, highlightedTextElement) {
    await highlightedTextElement.focus();
    await highlightedTextElement.click({modifiers:['Alt']});
    // await page.waitForSelector('time');
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
    var timecodeFull = await page.$('time');
    var timecode = timecodeFull.split('/')[0];
    return timecode.trim();
}

 async function hideElement(page, selector) {
    const el = await page.locator(selector);
    el.evaluate(element => element.style.display = 'none');
 }

main()
