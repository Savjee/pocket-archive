const GetPocket = require('node-getpocket');

/**
 * Class that is responsible for getting all our bookmarks
 * from Pocket and returning them as an array of objects.
 */
module.exports = class PocketConnector {

    constructor() {
        this.pocket = new GetPocket({
            consumer_key: process.env.POCKET_CONSUMER_KEY,
            access_token: process.env.POCKET_ACCESS_TOKEN,
        });
    }

    getItems() {
        return new Promise((resolve, reject) => {
            this.pocket.get({
                state: 'all',
                sort: 'newest',
                count: '10',
                detailType: 'simple'
            }, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const output = [];

                    // Transform the output to an array of objects
                    for (let key of Object.keys(response.list)) {
                        output.push(response.list[key]);
                    }

                    resolve(output);
                }
            })
        });
    }
}