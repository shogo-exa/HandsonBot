const builder = require('botbuilder');
const log = require('../log.js');

var lib = new builder.Library('20Q');

const question = [
    "ゴルフボールより小さいですか？",
    "丸いですか？",
    "弾力はありますか？",
    "食べることが出来ますか？",
    "水に浸けても大丈夫ですか？"
]

const menu = {
    "YES": {
        score: 1
    },
    "NO": {
        score: -1
    }
}
const triggerRegExp = "^20Q$|^20q$"

lib.dialog('20Q', [
    (session, args, next) => {
        // まだゲームは開始されていない
        session.send("ノートパソコンかガムを思い浮かべてください");
        builder.Prompts.choice(session, "準備はいいですか？", ["START", "CANCEL"]);
    },
    (session, res, next) => {
        switch (res.response.entity) {
            case "START":
                session.send("始めます！");
                session.privateConversationData.question_num = 0;
                session.privateConversationData.score = 0;
                session.beginDialog("20Q_question");
                break;

            case "CANCEL":
                session.endConversation("中止します");
                break;
        }
    },
    (session, args, next) => {
        if (session.privateConversationData.score > 0) {
            session.send("あなたがイメージしたのはガムですね！");
            builder.Prompts.choice(session, "YES or NO!", menu);
        } else if (session.privateConversationData.score < 0) {
            session.send("あなたがイメージしたのはノートパソコンですね！");
            builder.Prompts.choice(session, "YES or NO!", menu);
        } else {
            session.endConversation("あなたが何をイメージしているのか分からない...")
        }
    },
    (session, results, next) => {
        if (menu[results.response.entity].score == 1) {
            session.endConversation("当たりました！");
        } else if (menu[results.response.entity].score == -1) {
            session.endConversation("外れました...");
        }
    }
]).triggerAction({
    matches: [RegExp(triggerRegExp)],
    confirmPrompt: "20Qゲームを始めますか？"

}).beginDialogAction("20QHelpAction", "wiki_20Q", {
    matches: /^help$/i,

}).cancelAction('cancel20Q', "キャンセルしました", {
    // キャンセルのトリガーとなるパターンを定義
    matches: /^cancel|^stop|^end/i,
    // キャンセルを再度確認する為にユーザーへ送信される文字列
    confirmPrompt: "20Qを終了しますか？",
});

lib.dialog("20Q_question", [
    (session, args) => {
        // ゲームが正常に開始されている
        if (session.privateConversationData.hasOwnProperty("question_num")) {
            var question_num = session.privateConversationData.question_num
            session.send("Q" + (question_num + 1) + question[question_num]);
            builder.Prompts.choice(session, "YES or NO!", menu);
        } else {
            session.send("ゲームに問題が有りました。")
            session.endConversation("中止します");
        }
    },
    (session, results) => {
        if (results.response) {
            session.privateConversationData.score += menu[results.response.entity].score;
            session.privateConversationData.question_num++;
            if (session.privateConversationData.question_num >= 5) {
                session.endDialog();
            }
            session.replaceDialog("20Q_question")
        }
    }
]);

module.exports.createLibrary = function () {
    return lib.clone();
};