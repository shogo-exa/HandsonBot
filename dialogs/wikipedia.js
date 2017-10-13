const builder = require('botbuilder');
const log = require('../log.js');
const request = require('request');
const async = require('async');


var lib = new builder.Library('wikipedia');

const triggerRegExp = ["(.+)について(教えて|おしえて)$", "^wiki( |　)(.+)"]
const ExtractionRegExp = ["について(教えて|おしえて)$", "^wiki( |　)"]

lib.dialog('search', [
    (session, args, next) => {
        const searchWord = ExtractionSearchWord(session.message.text);
        sendRequest(searchWord, session);
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
            prop: 'info',
            exintro: '',
            explaintext: '',
            titles: word
        }
    }
    async.series([(next) => {
        request(options, function (error, response, body) {
            if (error) {
                next(error, null);
            } else {
                log.console("wiki_response", response);
                log.console("wiki_body", body);
                next(null, response);
            }
        })
    }], (err, results) => {
        if (err) {
            session.send("えらー");
            log.console("wikipedia_error", err)
        } else {
            session.endConversation(results[0]);
        }
    })
}