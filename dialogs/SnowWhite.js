const builder = require('botbuilder');
const log = require('../log.js');

var lib = new builder.Library('SnowWhite');

lib.dialog('/', [
    (session, args, next) => {

    },
]);

module.exports.createLibrary = function () {
    return lib.clone();
};