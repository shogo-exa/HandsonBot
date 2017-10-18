// region ***** require *****
const restify = require('restify');
const builder = require('botbuilder');
const log = require('./log')
// endregion

//region ***** Server セットアップ *****/
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log("Server Start");
});
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID, // MBFPortalに作成したボットのID
    appPassword: process.env.MICROSOFT_APP_PASSWORD // MBFPortalに作成したボットのPassword
});

server.post('/', connector.listen()); // 例：https://xxx.co.jp/
//endregion

//region ***** Bot セットアップ ***** /
var bot = module.exports = new builder.UniversalBot(connector, [
    (session, args, next) => {
        if (session.message.text == "オブビリエイト") {
            if (session.userData.isKnown) session.userData = {};
            session.endConversation();
            return;
        }
        if (!session.userData.isKnown) {
            session.beginDialog("firstTime");
        }
    }
]);
bot.dialog("firstTime", [
    (session, args, next) => {
        session.userData.isKnown = true;
        session.save();
        session.send("はじめまして！");
        session.send("私には様々な機能が実装されています。")
        session.endDialog("どんな機能を持っているかを知りたい場合は「help」と入力してください。")
    }
]);

bot.library(require('./dialogs/wikipedia').createLibrary());
bot.library(require('./dialogs/20Q').createLibrary());
bot.library(require('./dialogs/SnowWhite').createLibrary());
bot.library(require('./dialogs/help').createLibrary());


bot.on('conversationUpdate', function (message) {});
//endregion