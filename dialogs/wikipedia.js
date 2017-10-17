const builder = require('botbuilder');
const log = require('../log.js');
// const request = require('request');
const request = require('superagent');
const async = require('async');


var lib = new builder.Library('wikipedia');

const triggerRegExp = ["(.+)について(教えて|おしえて)$", "^wiki( |　)(.+)"]
const ExtractionRegExp = ["について(教えて|おしえて)$", "^wiki( |　)"]

lib.dialog('search', [
    (session, args, next) => {
        // 検索ワードを取得する
        const searchWord = ExtractionSearchWord(session.message.text);

        // リクエスト情報を作成
        request.get('https://ja.wikipedia.org/w/api.php')
            .query({
                format: 'json',
                action: 'query',
                prop: "extracts",
                exintro: "true", // booleanの指定に値は関係なく、パラメーターが設定されていれば真と判定される
                explaintext: "true",
                redirects: "true",
                utf8: "true",
                titles: searchWord
            }).end((err, res) => {
                // 検索結果は文字列として処理されているのでJSON形式に変換する
                var pages = JSON.parse(res.text).query.pages;
                log.log("wiki_parse", pages)
                var results = [];
                for (var id in pages) {
                    session.send(pages[id].title);
                    session.send(pages[id].extract);

                }
            })
    }
]).triggerAction({
    matches: [RegExp(triggerRegExp[0]), RegExp(triggerRegExp[1])]
});

function ExtractionSearchWord(message) {
    for (var regExp of ExtractionRegExp) {
        message = message.replace(RegExp(regExp), "");
    }
    log.console("search_message", message);

    return message;
}

module.exports.createLibrary = function () {
    return lib.clone();
};