const fs = require('fs');
const snapshotter = require('./snapshotter');
const googleUploader = require('./googleUploader');
const backblazeUploader = require('./backblazeUploader');
require('dotenv').config({ path: '../.env' });


(async () => {
  const data = fs.readFileSync('../ril_export.html', 'utf8');
  const regex = /href="(.*?)"/gi;

  while (match = regex.exec(data)) {
    try {
      const url = match[1];
      const filePath = await snapshotter(url, 'output');
      // const logData = await backblazeUploader('./' + filePath);
      const logData = await googleUploader('./' + filePath);

      fs.unlinkSync(filePath);
    } catch (error) {
      console.log('Error while fetching that page!', error);
      // throw error;
    }
  }
})();