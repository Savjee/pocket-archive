import log from '../utils/log'
import pdf, { makePrintOptions } from '../chrome/pdf'
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const drive = google.drive({ version: 'v3' });
require('dotenv').config();
const stream = require('stream');
const hashCalc = require('../utilities/hashCalc');


export default async function handler(event, context, callback) {
  console.log(event);

  if (!event.body) {
    return callback("No body in event!");
  }

  // The body we receive is encoded in base64 because we set the "BinaryMediaTypes"
  // in API Gateway. Start by decoding it and parsing to JSON!
  const body = Buffer.from(event.body, 'base64').toString('ascii');
  const decodedBody = JSON.parse(body);

  if (!decodedBody || !decodedBody.url) {
    return callback("No decoded body or URL passed");
  }

  const queryStringParameters = event.queryStringParameters || {};

  const {
    url = decodedBody.url,
    ...printParameters
  } = queryStringParameters
  const printOptions = makePrintOptions(printParameters);
  let data;

  log('Processing PDFification for', url, printOptions)

  const startTime = Date.now()

  try {
    data = await pdf(url, printOptions)
  } catch (error) {
    console.error('Error printing pdf for', url, error)
    return callback(error)
  }

  log(`Chromium took ${Date.now() - startTime}ms to load URL and render PDF.`);

  const oauth2Client = new OAuth2(
    process.env.DRIVE_CLIENT_ID,
    process.env.DRIVE_CLIENT_SECRET,
    'http://localhost' // The redirect URL
  );

  oauth2Client.setCredentials({
    access_token: 'ya29.GlsxBvbZuCR3izDLTV4uyIiouRk96xqquIfgL-x0d1jRnrOdThRoM8_6Lcg9JQ6b_wI-awiMK3CNZNmYrvmOmqSbkg79IvKXfEyFmyRy-zgaY4okXXVTlELUbuS5',
    refresh_token: '1/G6ftHgcQslzwghQcCTmRK6V5W9kAFxtiCvdtmkPq04qicNCmf7z3lVqciDo5XC0d',
    scope: 'https://www.googleapis.com/auth/drive.file',
    token_type: 'Bearer',
    expiry_date: 1539070555915
  });

  var bufferStream = new stream.PassThrough();
  bufferStream.end(new Buffer(data, 'base64'));

  const shortHash = hashCalc(url, true);

  drive.files.create({
    resource: {
      name: shortHash + '.pdf',
      mimeType: 'application/pdf',
      parents: ['1LwWwqTMW7kxdh3UDH7iN0fe84OISny26']
    },
    media: {
      mimeType: 'application/pdf',
      body: bufferStream
    },
    auth: oauth2Client
  }, (error, date) => {
    if (error) {
      console.log(error);
    }
  });

  return callback(null, {
    statusCode: 200,
    body: "OK",
  });
}
