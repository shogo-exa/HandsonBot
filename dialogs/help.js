const builder = require('botbuilder');
const log = require('../log.js');

var lib = new builder.Library('Help');

const triggerRegExp = "^help$"

const func = {
    "wiki": "wiki",
    "20Q": "wiki",
    "weather": "weather"
}

lib.dialog('help_global', [
    (session, args, next) => {
        // var replyData = new builder.Message(session);
        // replyData.attachmentLayout(builder.AttachmentLayout.carousel);
        // replyData.attachments([
        //     new builder.HeroCard(session)
        //     .title('私はこんなことが出来ます。')
        //     .subtitle('help')
        //     .text('更に機能の詳細を知りたい場合は選択してください')
        //     .buttons([
        //         builder.CardAction.imBack(session, 'wiki', 'wikipedia検索'),
        //         builder.CardAction.imBack(session, '20Q', '20Qで遊ぶ'),
        //         builder.CardAction.imBack(session, 'weather', '今日の天気')
        //     ])
        // ]);
        builder.Prompts.choice(session, "更に機能の詳細を知りたい場合は選択してください", func);
    },
    (session, res, next) => {
        log.log("ユーザーが選んだ", res.response)
        switch (res.response.entity) {
            case "wiki":
                session.replaceDialog("help_wiki")
                break;
            case "20Q":
                session.replaceDialog("help_20Q")
                break;

            case "weather":
                session.replaceDialog("help_weather")
                break;
        }
    }
]).triggerAction({
    matches: [RegExp(triggerRegExp)],
    confirmPrompt: "私の機能一覧を表示します。現在の会話は終了しますがよろしいですか？"
});

lib.dialog("help_wiki", [
    (session, args, next) => {
        log.log("wiki_help", "")
        session.send("Wikipediaでキーワードの概要を検索します。");
        session.send("wiki ボット");
        session.send("と入力して頂くと、ボットとは何かを私が検索します。");
        session.send("ボットについて教えて");
        session.endDialog("と言っていただいても構いません。");
    }
])
lib.dialog("help_20Q", [
    (session, args, next) => {
        log.log("20q_help", "")
        session.endDialog("工事中(´・ω・｀)")
    }
])
lib.dialog("help_weather", [
    (session, args, next) => {
        log.log("weather_help", "")
        session.endDialog("工事中(´・ω・｀)")
    }
])

module.exports.createLibrary = function () {
    return lib.clone();
};