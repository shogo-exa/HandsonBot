const builder = require('botbuilder');
const log = require('../log.js');

var lib = new builder.Library('Help');

const triggerRegExp = "^help$"

const func = [
    "wiki",
    "20Q",
    "weather"
]

lib.dialog('help_global', [
    (session, args, next) => {
        builder.Prompts.choice(session, "詳しく知りたい機能を選んでください", func);
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
    matches: RegExp(triggerRegExp),
    onSelectAction: (session, args, next) => {
        log.log("triggerAction args", args);
        session.beginDialog(args.action, args);
    }
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