const fs = require('fs');
const path = require('path');
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const drive = google.drive({ version: 'v3' });
require('dotenv').config({ path: '../../.env' });


module.exports = class GoogleDrive {
  constructor() {
    this.oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://localhost/'
    );

    this.oauth2Client.credentials = {
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    };
  }

  /**
   * Uploads a new file to Google Drive
   * @param {string} pathToFile Path to the file that should be uploaded
   * @param {string} fileName Optional, if set, the file will get this name
   * @returns {Promise}
   */
  uploadFile(pathToFile, fileName) {
    return new Promise((resolve, reject) => {
      drive.files.create(
        {
          resource: {
            name: fileName || path.basename(pathToFile),
            parents: [process.env.GOOGLE_FOLDER_ID],
            mimeType: 'application/pdf'
          },
          media: {
            mimeType: 'application/pdf',
            body: fs.readFileSync(pathToFile)
          },
          auth: this.oauth2Client
        },
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  /**
   * Checks if a given filename exists in Google Drive
   * @param {string} filename The filename to search for
   * @returns {Promise<boolean>}
   */
  checkIfFileExists(filename) {
      return new Promise((resolve, reject) => {
        drive.files.list({
            q: `name contains '${filename}' and not trashed`,
            fields: 'files(id, name)',
            spaces: 'drive',
            auth: this.oauth2Client
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.files.length > 0);
            }
        })
    });
  }
}
