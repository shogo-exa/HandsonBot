const builder = require('botbuilder');
const log = require('../log.js');
const request = require('request');
const async = require('async');


var lib = new builder.Library('wikipedia');

const triggerRegExp = ["(.+)を(教えて | おしえて)$", "^wiki( |　)(.+)"]

lib.dialog('search', [
    (session, args, next) => {
        const searchWord = ExtractionSearchWord(session.message);
        sendRequest(searchWord, session);
    }
]).triggerAction({
    matches: [RegExp(triggerRegExp[0]), RegExp(triggerRegExp[1])]
});

function ExtractionSearchWord(message) {
    log.console("message", message);
    for (var regExp of triggerRegExp) {
        message = message.replace(RegExp(regExp), "");
    }
    return message;
}

module.exports.createLibrary = function () {
    return lib.clone();
};

function sendRequest(word, session) {
    var options = {
        url: 'https://ja.wikipedia.org/w/api.php',
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        form: {
            format: 'json',
            action: 'query',
            prop: 'extracts',
            exintro: '',
            explaintext: '',
            titles: word
        }
    }
    request(options, function (error, response, body) {
        log.console("wiki_error", error);
        log.console("wiki_response", response);
        log.console("wiki_body", body);
    })
}