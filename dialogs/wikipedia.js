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
        var result = getWikipedia(searchWord, session);
        log.console("wiki_result", result);
        session.send(result);
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

function getWikipedia(word, session) {
    console.log("はじまり")
    var options = {
        url: 'https://ja.wikipedia.org/w/api.php',
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        form: {
            action: "opensearch",
            search: word
        }
    }
    var result;
    async.series([(next) => {
        request(options, function (error, response, body) {
            if (error) {
                next(error, null);
            } else {
                // log.console("wiki_response", response);
                // log.console("wiki_body", body);
                next(null, response)
            }
        })
    }], (err, results) => {
        if (err) {
            session.send("えらー");
            log.console("wikipedia_error", err)
        } else {
            log.console("wiki_results", results);
            result = results[0];
        }
    })
    console.log("おわり")
    return result;
}



module.exports.createLibrary = function () {
    return lib.clone();
};