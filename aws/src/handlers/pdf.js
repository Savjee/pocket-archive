const chromium = require('chrome-aws-lambda');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const drive = google.drive({ version: 'v3' });
const stream = require('stream');
const hashCalc = require('../utilities/hashCalc');
require('dotenv').config();


module.exports.handler = async function(event, context, callback) {
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

    const url = decodedBody.url;
    if (!url) { return callback("No URL to archive"); }


    console.log('Processing PDFification for', url);

    // The actual magic!
    const pdfBuffer = await makePDF(url);
    if(pdfBuffer === false){
        return callback('Chromium could not make a PDF');
    }

    await uploadToGDrive(pdfBuffer, url);

    return callback(null, {
        statusCode: 200,
        body: "OK",
    });
}

async function makePDF(url) {
    console.time('Chrome PDF generation');

    let browser = null;
    let pdfBuffer = null;

    try {
        browser = await chromium.puppeteer.launch({
            args: [
                '--headless',
                '--disable-gpu',
                '--unlimited-storage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--single-process'
            ],
            defaultViewport: {
                width: 1696,
                height: 1280,
                isLandscape: true,
            },
            executablePath: await chromium.executablePath,
            headless: true,
        });

        let page = await browser.newPage();

        await page.goto(url, {
            waitUntil: [
                'load'
            ],
            timeout: 50 * 1000
        });

        pdfBuffer = await page.pdf({
            printBackground: false,
            format: 'A4',
            displayHeaderFooter: false,
        });
    } catch (error) {
        console.log("Chromium error", error);
        return false;
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    console.timeEnd('Chrome PDF generation');
    return pdfBuffer;
}

async function uploadToGDrive(pdfBuffer, url) {
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
    bufferStream.end(new Buffer(pdfBuffer, 'base64'));

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
}