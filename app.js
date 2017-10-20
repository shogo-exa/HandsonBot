// region ***** require *****
const restify = require('restify');
const builder = require('botbuilder');
const scheduler = require('node-schedule');
const log = require('./log')
const request = require('superagent');

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
        } else if (session.message.text == "myData") {
            for (var k in session.userData) {
                session.send(k + ": " + session.userData[k]);
            }
            return;
        }
        if (!session.userData.isKnown) {
            session.beginDialog("firstTime");
        } else {
            session.send(session.userData.name + "さん　こんにちは！");
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
        session.userData.id = createPrivateid(10);

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
// リマインドの登録
bot.customAction({
    matches: /^remind ([1-2]|)[0-9]:[0-9][0-9] (.+)$/i,
    onSelectAction: (session, args, next) => {
        log.log("userRequest", session.message.text);
        const request = session.message.text.split(" ");
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

        const reservationId = createPrivateid(5);

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
        }).on("canceled", () => {
            session.send("リマインドをキャンセルしました。");
        });
        session.send("リマインドを登録しました。(ID：" + reservationId + ")")

    }
});

// 天気取得
bot.customAction({
    matches: /^weather$/i,
    onSelectAction: (session, args, next) => {
        // 定期処理を実行されているかを判定
        if (session.userData.isRegularly) {
            if (!scheduler.cancelJob("regularly_" + session.userData.id)) {
                session.send("定期連絡の停止に問題が有りました")
            }
        } else {
            var reservation = scheduler.scheduleJob("regularly_" + session.userData.id, {
                // hour: today.getHours(),
                // minute: today.getMinutes(),
                second: 30
            }, () => {
                session.send("今日の天気");
                request.get('http://api.openweathermap.org/data/2.5/forecast')
                    .query({
                        id: '6415253',
                        appid: 'afcb81f9414a3f217d66f92f3409e710',
                    }).end((err, res) => {
                        var weatherList = createWeatherData(res, 12);
                        log.log("weatherList", weatherList);
                        for (var i in weatherList) {
                            log.log("weatherData", weatherList[i]);
                            session.send(weatherList[i].date + "：" + weatherList[i].text);
                        }
                    })
            }).on("canceled", () => {
                session.send("天気予報を停止しました。");
                session.userData.isRegularly = false;
            });
            session.userData.isRegularly = true;
            session.send("天気予報を開始しました。")
        }
    }
});

// 予約キャンセル
bot.customAction({
    matches: /^remind cancel (.+)$/i,
    onSelectAction: (session, args, next) => {
        var jobId = session.message.text.split(" ")[2];

        if (!scheduler.cancelJob(jobId)) {
            session.send("リマインドのキャンセルに失敗しました。");
            session.send("名前を確認してください");
        }
    }
});
//endregion

function createPrivateid(n) {
    var CODE_TABLE = "0123456789" +
        "abcdefghijklmnopqrstuvwxyz";
    var r = "";
    for (var i = 0, k = CODE_TABLE.length; i < n; i++) {
        r += CODE_TABLE.charAt(Math.floor(k * Math.random()));
    }
    return r;
}

function createWeatherData(weatherData, hour) {
    const INTERVAL = 3; // APIで取れる間隔が3時間
    var weatherList = JSON.parse(weatherData.text).list;
    var ret = [];

    for (var i = 0; i < hour / INTERVAL; i++) {
        var weather = {};
        weather.text = weatherList[i].weather[0].main;
        weather.date = weatherList[i].dt_txt;
        ret.push(weather);
    }
    return ret;
}