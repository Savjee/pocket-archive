const fs = require('fs');
const snapshotter = require('./snapshotter');

(async () => {
  const data = fs.readFileSync('../ril_export.html', 'utf8');
  const regex = /href="(.*?)"/gi;

  while (match = regex.exec(data)) {
    try {
      const url = match[1];
      await snapshotter(url, 'output');
    } catch (error) {
        console.log('Error while fetching that page!', error);
    }
  }
})();