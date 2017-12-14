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

  const outputFile = outputPath + '/' + hash + '.pdf';

  console.log('Fetching ' + url);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle2'] });
  await page.emulateMedia('screen');
  await page.setViewport({ width: 1400, height: 100000 });

  //scroll down to do lazy loading
  await page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
  });

  // Wait 10 seconds just to make sure all images are correctly loaded
  console.log('just waiting 10s');
  await new Promise(resolve => setTimeout(resolve, 10 * 1000));

  console.log('snapshotting pdf');
  await page.pdf({ path: outputFile, width: 1400 });
  await page.close();
  await browser.close();
}