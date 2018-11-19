const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = "XXXX.apps.googleusercontent.com";
const CLIENT_SECRET = "XXXXX";

var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost' // The redirect URL
);

oauth2Client.setCredentials({
    access_token: 'XXXX',
    refresh_token: '1/XXXX',
    scope: 'https://www.googleapis.com/auth/drive.file',
    token_type: 'Bearer',
    expiry_date: 1539070555915
});

