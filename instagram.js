const puppeteer = require('puppeteer');

let browser, page;

const instagram = {
    initialize: async (username, password, url) => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
        await page.goto('https://www.instagram.com/');
        await page.waitForSelector('[aria-label~="Phone"]');
        await page.waitForSelector('[aria-label~="Password"]');
        await page.type('[aria-label~="Phone"]', username, { delay: 100 });
        await page.type('[aria-label~="Password"]', password, { delay: 100 });
        await page.click('button[type="submit"]', { delay: 100 });
        await page.waitForSelector('section.ABCxa');
        await page.goto(url);
    },

    scrapeComments: async () => {

        let commentsArray = await page.$$('ul.Mr508');

        while (true) {
            try {
                await page.waitForSelector('.XQXOT button.dCJp8.afkep > span');
                await page.click('.XQXOT button.dCJp8.afkep > span', { delay: 100 });
            } catch (error) {
                commentsArray = await page.$$('ul.Mr508');
                break;
            }
        }

        return commentsArray;

    },

    scrapeReplies: async (node) => {

        const username = await node.$eval('div.C4VMK a', el => el.innerText);
        const comment = await node.$eval('div.C4VMK > span', el => el.innerText);
        const datetime = await node.$eval('div.C4VMK > div time', el => el.getAttribute('datetime'));

        let replies = new Array();
        let likes = new Array();

        if (await node.$('ul.TCSYW')) {

            while (true) {
                await node.evaluate(el => el.querySelector('li._61Di1 button > span').click());
                if (await node.evaluate(el => el.querySelector('li._61Di1 button > span').innerText) === 'Hide replies') break;
            }

            replies = await node.$$('ul.TCSYW > div.ZyFrc');

        }

        if (await node.evaluate(el => el.querySelector('div.C4VMK > div > div').childElementCount) === 3) {

            let queryArray = new Array();
            await node.evaluate(el => el.querySelector('div.C4VMK > div > div :nth-child(2)').click());

            await page.on('response', async (response) => {
                if (response.url().match(/query\/\?query_hash=.*variables=.*comment_id.*/)) {
                    const query = await response.json();
                    queryArray.push(query['data']['comment']["edge_liked_by"]);
                }
            });

            await page.waitForSelector('[style="height: 356px; overflow: hidden auto;"] div[aria-labelledby]');

            while (true) {
                await page.evaluate(() => document.querySelector('[style="height: 356px; overflow: hidden auto;"]').scrollBy({ top: 1000, behavior: "smooth" }));

                await page.on('response', async (response) => {
                    if (response.url().match(/query\/\?query_hash=.*variables=.*comment_id.*/)) {
                        const query = await response.json();
                        queryArray.push(query['data']['comment']["edge_liked_by"]);
                    }
                });

                if (!queryArray[queryArray.length - 1]['page_info']['has_next_page']) break;
            }

            await page.evaluate(() => document.querySelector('div._1XyCr div.WaOAr > button').click());

            for (query of queryArray[0]['edges']) {
                likes.push({
                    username: query['node']['username'],
                    avatar: query['node']['profile_pic_url']
                });
            }

        }

        return { username, comment, datetime, replies, likes };

    },

    processData: async (node) => {

        const username = await node.$eval('div.C4VMK > h3 a', el => el.innerText);
        const text = await node.$eval('div.C4VMK > span', el => el.innerText);
        const datetime = await node.$eval('div.C4VMK > div time', el => el.getAttribute('datetime'));

        let likes = new Array();

        if (await node.evaluate(el => el.querySelector('div.C4VMK > div > div').childElementCount) === 3) {

            let queryArray = new Array();
            await node.evaluate(el => el.querySelector('div.C4VMK > div > div :nth-child(2)').click());

            await page.on('response', async (response) => {
                if (response.url().match(/query\/\?query_hash=.*variables=.*comment_id.*/)) {
                    const query = await response.json();
                    queryArray.push(query['data']['comment']["edge_liked_by"]);
                }
            });

            await page.waitForSelector('[style="height: 356px; overflow: hidden auto;"] div[aria-labelledby]');

            while (true) {
                await page.evaluate(() => document.querySelector('[style="height: 356px; overflow: hidden auto;"]').scrollBy({ top: 1000, behavior: "smooth" }));

                await page.on('response', async (response) => {
                    if (response.url().match(/query\/\?query_hash=.*variables=.*comment_id.*/)) {
                        const query = await response.json();
                        queryArray.push(query['data']['comment']["edge_liked_by"]);
                    }
                });

                if (!queryArray[queryArray.length - 1]['page_info']['has_next_page']) break;
            }

            await page.evaluate(() => document.querySelector('div._1XyCr div.WaOAr > button').click());

            for (query of queryArray[0]['edges']) {
                likes.push({
                    username: query['node']['username'],
                    avatar: query['node']['profile_pic_url']
                });
            }

        }

        return { username, text, datetime, likes }
    }

}

module.exports = instagram;