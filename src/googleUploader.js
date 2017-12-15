const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const drive = google.drive({ version: 'v3' });
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });


module.exports = function GoogleUploader(pathToFile) {
  return new Promise((resolve, reject) => {

    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://localhost/'
    );

    oauth2Client.credentials = {
      access_token:process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    };

    drive.files.create(
      {
        resource: {
          name: path.basename(pathToFile),
          parents: [process.env.GOOGLE_FOLDER_ID],
          mimeType: 'application/pdf'
        },
        media: {
          mimeType: 'application/pdf',
          body: fs.readFileSync(pathToFile)
        },
        auth: oauth2Client
      },
      (error, data) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log(data);
          resolve(data);
        }
      }
    );
  });
};
