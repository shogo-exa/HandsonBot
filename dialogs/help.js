const builder = require('botbuilder');
const log = require('../log.js');

// この機能の名前を定義
var lib = new builder.Library('Help');

// 機能を実行する為のキーワードの正規表現
const triggerRegExp = "^help$"

// 実装されているヘルプの一覧
const func = [
    "wiki",
    "20Q",
    "weather"
]

// 他機能の未実行時に開始するヘルプ機能
lib.dialog('help_global', [
    (session, args, next) => {
        // ユーザーにどの機能のヘルプを実行したいかを問い合わせる
        builder.Prompts.choice(session, "詳しく知りたい機能を選んでください", func);
    },
    (session, res, next) => {
        log.log("ユーザーが選んだ", res.response)

        // ユーザーが選択した機能に振り分ける
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

    // この機能を実行するためのトリガーを定義
]).triggerAction({
    matches: RegExp(triggerRegExp),
    onSelectAction: (session, args, next) => {
        log.log("triggerAction args", args);
        session.beginDialog(args.action, args);
    }
});

// wikiのヘルプを定義する
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

// 20Qのヘルプを定義する
lib.dialog("help_20Q", [
    (session, args, next) => {
        log.log("20q_help", "")
        session.endDialog("工事中(´・ω・｀)")
    }
])
// 天気予報のヘルプを定義する
lib.dialog("help_weather", [
    (session, args, next) => {
        log.log("weather_help", "")
        session.endDialog("工事中(´・ω・｀)")
    }
])

module.exports.createLibrary = function () {
    return lib.clone();
};
