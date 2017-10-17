const builder = require('botbuilder');
const log = require('../log.js');

var lib = new builder.Library('Help');

const triggerRegExp = "^help$"

lib.dialog('/', [
    (session, args, next) => {
        session.send("私はこんなことが出来ます。");

        var replyData = new builder.Message(session);
        replyData.attachmentLayout(builder.AttachmentLayout.carousel);
        replyData.attachments([
            new builder.HeroCard(session)
            .title('私が持つ機能')
            .subtitle('help')
            .text('更に機能の詳細を知りたい場合は選択してください')
            .buttons([
                builder.CardAction.imBack(session, 'wiki', 'wikipedia検索'),
                builder.CardAction.imBack(session, '20Q', '20Qで遊ぶ'),
                builder.CardAction.imBack(session, 'weather', '今日の天気')
            ])
        ]);
        session.send(replyData);
    },
    (session, res, next) => {
        switch (res.response) {
            case "wiki":
                session.send("Wikipediaでキーワードの概要を検索します。");
                session.send("wiki ボット");
                session.send("と入力して頂くと、ボットとは何かを私が検索します。");
                session.send("ボットについて教えて");
                session.endConversation("と言っていただいても構いません。");
                break;

            case "20Q":
                session.endConversation("工事中(´・ω・｀)");
                break;

            case "weather":
                session.endConversation("工事中(´・ω・｀)");
                break;
        }
    }
]).triggerAction({
    matches: [RegExp(triggerRegExp)]
});

module.exports.createLibrary = function () {
    return lib.clone();
};