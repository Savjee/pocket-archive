const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const drive = google.drive({ version: 'v3' });

const CLIENT_ID = "XXXX.apps.googleusercontent.com";
const CLIENT_SECRET = "XXXXX";

var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost' // The redirect URL
 );

 oauth2Client.credentials = {
    access_token: 'ya29.GlswBkzoHo9JLjkOo2Z1HUPq6b5fwjMVdzECk9Hu0rHhlVlSdXrsdfTXo1tE1DerVVXY84Vompxe68PFQbNcgXDxOHVrnsaMiTmjKDEHmnyx96TzNc6Oi98hrwTN',
    // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
    // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
 };

 drive.files.create({
	resource: {
		'name': 'pocket-archive',
		'mimeType': 'application/vnd.google-apps.folder'
	},
	fields: 'id',
	auth: oauth2Client
 }, (error, date) => {
     // Handle the callback
 });