import {URL_LOGIN, USER_EMAIL, USER_PASSWORD, URL_VIDEO} from './../config.js';

import playwright from 'playwright';

const textElement = 'span[style="background-color: rgba(0, 90, 80, 0.35);"] > span'

export async function scrape() {
    return (async () => {
        const browser = await playwright.firefox.launch({
            headless: false,
            // args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log("start");
        const context = await browser.newContext();
        const page = await context.newPage();

        console.log("login page");
        await page.goto(URL_LOGIN);
        await page.type('input[placeholder="Email"]', USER_EMAIL);
        await page.type('input[placeholder="Password"]', USER_PASSWORD);
        await page.click('button[data-testid="login-btn-login"]');
        await page.waitForNavigation();

        console.log("video page");
        await page.goto(URL_VIDEO, { waitUntil: 'domcontentloaded', timeout: 0 });
        await page.waitForNavigation();
        page.waitForSelector('div[class="WavePlayer__highlight"]');
        await page.waitForSelector('button[data-type="close"]'); // FALLIBLE
        await page.click('button[data-type="close"]');

        console.log("hide annoying elements");
        // await hideElement(page, 'footer[class="footer_main"]');
        await hideElement(page, 'div[class="WavePlayer__mediawrap isVideo isExpanded"]');
        await hideElement(page, 'header[class="AppBar"]');
        
        console.log("locate highlighted texts");
        const highlightedTexts = await page.locator(textElement).allInnerTexts();

        console.log(highlightedTexts);

        // await page.waitForTimeout(10000);
        // await browser.close();

        return highlightedTexts;
    })();
}

async function hideElement(page, selector) {
    const el = await page.locator(selector);
    el.evaluate(element => element.style.display = 'none');
 }