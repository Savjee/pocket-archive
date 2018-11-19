const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = "XXXX.apps.googleusercontent.com";
const CLIENT_SECRET = "XXXXX";


var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost' // The redirect URL
 );

// Generate URL to ask for these permissions
var scopes = [
  'https://www.googleapis.com/auth/drive.file',
];

var url = oauth2Client.generateAuthUrl({
	// 'online' (default) or 'offline' (gets refresh_token)
	access_type: 'offline',

	// If you only need one scope you can pass it as a string
	scope: scopes,
});

console.log(url);