const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: 'eu-west-1'
});

export default function handler(event, context, callback) {
    console.log(event);

    const accountId = context.invokedFunctionArn.split(":")[4];
    console.log('Account id:', accountId);

    const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/' + accountId + '/xd-pocket-archive-mainqueue';
    console.log('Queue URL:', queueUrl);

    // response and status of HTTP endpoint
    var responseBody = {
        message: ''
    };
    var responseCode = 200;

    // SQS message parameters
    var params = {
        MessageBody: event.body.toString(),
        QueueUrl: queueUrl
    };

    console.log('Publishing message to SQS...');
    sqs.sendMessage(params, function(err, data) {
        console.log('called inside SQS callback!');

        if (err) {
            console.log('error:', "failed to send message" + err);
            responseCode = 500;
        } else {
            console.log('data:', data.MessageId);
            responseBody.message = 'Sent to ' + queueUrl;
            responseBody.messageId = data.MessageId;
        }

        const response = {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseBody)
        };

        return callback(null, response);
    });

    console.log('Called after sendMessage');
}
