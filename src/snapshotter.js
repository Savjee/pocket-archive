const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Responsible for exporting a snapshot of a given URL to a given path.
 * @param {*} url
 * @param {*} outputPath
 */
module.exports = async function snapshotter(url, outputPath) {
  const hash = crypto
    .createHash('sha256')
    .update(url)
    .digest('hex')
    .substring(0, 10);

  let outputFile = outputPath + '/';

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle2'] });
  await page.emulateMedia('screen');
  await page.setViewport({ width: 1400, height: 100000 });

  let pageTitle = await page.title();
  pageTitle = pageTitle.replace(/[^a-zA-Z ]/g, '');
  pageTitle = pageTitle.toLowerCase().replace(/\s/gi, '-').substring(0,30);

  outputFile += hash.substring(0,10) + '-' + pageTitle + '.pdf';

  //scroll down to do lazy loading
  await page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
  });

  // Wait 10 seconds just to make sure all images are correctly loaded
  await new Promise(resolve => setTimeout(resolve, 10 * 1000));

  await page.pdf({ path: outputFile, width: 1400 });
  await page.close();
  await browser.close();

  return outputFile;
}
