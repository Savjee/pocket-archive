const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = "XXXX.apps.googleusercontent.com";
const CLIENT_SECRET = "XXXXX";

var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost' // The redirect URL
);


oauth2Client.getToken('4/cwBuThIxrcT9tKazZNkmePQBnPVA8zkx5qyCFvh54K5KWLA2Lm3o_3LPhzOIdGRQl36mFbR5XbZbjIGNy61pBOY', function (err, tokens) {
	if (err) {
		console.log("ERROR");
		console.log(err);
		return false;
	}

	// Now tokens contains an access_token and an optional refresh_token. Save them.
	console.log(tokens);
});