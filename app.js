// region ***** require *****
const restify = require('restify');
const builder = require('botbuilder');
const scheduler = require('node-schedule');
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
            session.userData = {};
            session.endConversation("＼(゜ロ＼)ココハドコ? (／ロ゜)／アタシハダレ?");
            return;
        }
        if (!session.userData.isKnown) {
            session.beginDialog("firstTime");
        } else {
            session.send(session.userData.name + "さん　こんにちは！")
        }
    }
]);
bot.dialog("firstTime", [
    (session, args, next) => {
        session.send("はじめまして！");
        builder.Prompts.text(session, "あなたの名前は何ですか？")
    },
    (session, results, next) => {
        session.userData.name = results.response;
        session.userData.isKnown = true;

        session.send(session.userData.name + "さん　よろしくお願いします！");
        session.endDialog("私が持つ機能を知りたい場合は「help」と入力してください");
    }
]);

bot.library(require('./dialogs/wikipedia').createLibrary());
bot.library(require('./dialogs/20Q').createLibrary());
bot.library(require('./dialogs/SnowWhite').createLibrary());
bot.library(require('./dialogs/help').createLibrary());


bot.on('conversationUpdate', function (message) {});
//endregion

//region ***** CustomAction の設定 *****
bot.customAction({
    matches: /^remind ([1-2]|)[0-9]:[0-9][0-9] (.+)$/i,
    onSelectAction: (session, args, next) => {
        log.log("userRequest", session.message.text);
        const request = session.message.text.split(" ")
        const TIME = 1;
        const MESSAGE = 2;

        // 現在の日時を取得
        var today = new Date();

        // 時分を抽出する
        var time = request[TIME];
        log.log("user_time", time);

        // 時間のみを抽出する
        var hour = time.split(":")[0];
        // 分のみを抽出する
        var min = time.split(":")[1];

        // 予約時間を設定する
        today.setHours(hour, min);

        // リマインド時に使用するメッセージを抽出する
        var message = request[MESSAGE];

        const reservationId = create_privateid(5);

        log.log("Reservation_time", today.toJSON());
        log.log("Reservation_msg", message);
        log.log("Reservation_id", reservationId);

        // 予約を登録する
        var reservation = scheduler.scheduleJob(reservationId, {
            year: today.getFullYear(),
            month: today.getMonth(),
            day: today.getDay(),
            hour: today.getHours(),
            minute: today.getMinutes()
        }, () => {
            session.send("リマインド：" + message);
        })
        reservation.on("scheduled", () => {
            session.send("リマインドの登録が完了しました(ID：" + reservationId + ")");
        })
        reservation.on("canceled", () => {
            session.send("リマインドをキャンセルしました。");

        });

    }
})

bot.customAction({
    matches: /^remind cancel (.+)$/i,
    onSelectAction: (session, args, next) => {
        var jobId = session.message.text.split(" ")[2];

        if (!scheduler.cancelJob(jobId)) {
            session.send("リマインドのキャンセルに失敗しました。");
            session.send("名前を確認してください");
        }
    }
})
//endregion


function create_privateid(n) {
    var CODE_TABLE = "0123456789" +
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz";
    var r = "";
    for (var i = 0, k = CODE_TABLE.length; i < n; i++) {
        r += CODE_TABLE.charAt(Math.floor(k * Math.random()));
    }
    return r;
}