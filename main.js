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

        // const page2 = await context.newPage();
        await page.goto(config.URL_VIDEO, { waitUntil: 'domcontentloaded', timeout: 0 });
        page.waitForNavigation();
        await page.waitForSelector('div[class="WavePlayer__highlight"]'); // does not work
        await page.waitForSelector('button[data-type="close"]');
        await page.click('button[data-type="close"]');
        

        var highlightedTextElements = await page.$$('span[style="background-color: rgba(0, 90, 80, 0.35);"] > span');
        var highlightedTextArray = [];
        for (let i = 0; i < highlightedTextElements.length; i++) {
            let highlightedTextElement = highlightedTextElements[i];
            hlText = await (await highlightedTextElement.getProperty('innerText')).jsonValue();
            console.log(hlText);
            await altClickInTimecode(page, highlightedTextElement);
            // let tcIn = await getTimecode(page);
            // await altClickOutTimecode(page, highlightedTextElement);
            // let tcOut = await getTimecode(page);
        }
    })();
}

async function altClickInTimecode(page, highlightedTextElement) {
    await highlightedTextElement.focus();
    await page.keyboard.down('Alt');
    await highlightedTextElement.click();
    await page.keyboard.up('Alt');
    await page.waitForSelector('time');
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

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

main()
