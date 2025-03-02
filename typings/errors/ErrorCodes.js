'use strict';
/**
 * @typedef {Object} DcbErrorCodes
 *
 * @property {'InvalidType'} InvalidType
 * @property {'MissingArgument'} MissingArgument
 *
 * @property {'NotReady'} NotReady
 *
 * @property {'FailedCall'} FailedCall
 * */
const keys = [
    'InvalidType',
    'MissingArgument',
    'NotReady',
    'FailedCall',
];
/**
 * @type {DcbErrorCodes}
 * @ignore
 * */
module.exports = Object.fromEntries(keys.map(key => [key, key]));
