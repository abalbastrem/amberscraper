const config = require('./../config.js');

const { selectors } = require('playwright');

async function Do() {
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

        console.log(highlightedTexts);

        return highlightedTexts;
    })();
}

async function hideElement(page, selector) {
    const el = await page.locator(selector);
    el.evaluate(element => element.style.display = 'none');
 }

module.exports = Do;