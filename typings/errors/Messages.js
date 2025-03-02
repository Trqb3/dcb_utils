'use strict';
const DcbErrorCodes = require('../errors/ErrorCodes');
const Messages = {
    [DcbErrorCodes.InvalidType]: 'The provided type is invalid',
    [DcbErrorCodes.MissingArgument]: 'Missing argument',
    [DcbErrorCodes.NotReady]: 'The database connection is not ready',
    [DcbErrorCodes.FailedCall]: 'Failed to call the function',
};
module.exports = Messages;
