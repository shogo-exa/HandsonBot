// region ***** require *****
const restify = require('restify');
const builder = require('botbuilder');
const log = require('./log')

// dialog
const wikipedia = require('wikipedia').createLibrary();
const q20 = require('20Q').createLibrary();
const snowWhite = require('SnowWhite').createLibrary();

// endregion

//region ***** Server セットアップ *****/
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978);
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID, // MBFPortalに作成したボットのID
    appPassword: process.env.MICROSOFT_APP_PASSWORD // MBFPortalに作成したボットのPassword
});

server.post('/', connector.listen()); // 例：https://xxx.co.jp/
//endregion

//region ***** Bot セットアップ ***** /
var bot = module.exports = new builder.UniversalBot(connector, [
    (session, args, next) => {

    },
]);

bot.on('conversationUpdate', function (message) {});
//endregion