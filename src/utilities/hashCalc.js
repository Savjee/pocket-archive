const crypto = require('crypto');

/**
 * Calculates the hash of a given input string
 * @param {string} input The string that has to be hashed
 * @param {boolean} short If set to true, will return a shortned hash
 * @returns {string}
 */
function hashCalc(input, short) {
    const hash = crypto.createHash('sha256')
        .update(input)
        .digest('hex');

    if (short) {
        return hash.substring(0, 10);
    }

    return hash;
}

module.exports = hashCalc;