const fs = require('fs');
const snapshotter = require('./snapshotter');
const hashCalc = require('./utilities/hashCalc');
const GoogleDriveStorage = require('./storage/googleDrive');
const sleep = require('./utilities/sleep');
require('dotenv').config({ path: '../.env' });

(async () => {
  const data = fs.readFileSync('../ril_export.html', 'utf8');
  const regex = /href="(.*?)"/gi;

  const googleDrive = new GoogleDriveStorage();

  while (match = regex.exec(data)) {
    console.log('');

    try {
      const url = match[1];
      const shortHash = hashCalc(url, true);

      console.log('Fetching', url);

      // Does this file already exist in Google Drive?
      const response = await googleDrive.checkIfFileExists(shortHash);

      if (await googleDrive.checkIfFileExists(shortHash)) {
        console.log('--> URL was already grabbed!');
        await sleep(2); // Sleep a second to not hit rate limits
        continue;
      }

      // File doesn't exist, so take a PDF snapshot of it now!
      console.log('--> Taking snapshot...');
      const pathToGeneratedPDF = await snapshotter(url, 'output');

      // Upload it to Google Drive
      console.log('--> Upload to Google Drive...');
      const logData = await googleDrive.uploadFile('./' + pathToGeneratedPDF);

      // Remove it from our filesystem. It's safe with Google!
      fs.unlinkSync(pathToGeneratedPDF);

    } catch (error) {
      console.log('Error while fetching that page!', error);
    }
  }
})();