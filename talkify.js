/*****

node-red-contrib-talkify - A Node Red node to process natural language using Talkify

(https://www.npmjs.com/package/talkify)

MIT License

Copyright (c) 2017 Dean Cording

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Core dependency
const talkify = require('talkify');
const Bot = talkify.Bot;

const util = require('util');

// Types dependencies
const BotTypes = talkify.BotTypes;
const Message = BotTypes.Message;
const SingleLineMessage = BotTypes.SingleLineMessage;
const MultiLineMessage = BotTypes.MultiLineMessage;

// Skills dependencies
const Skill = BotTypes.Skill;

// Training dependencies
const TrainingDocument = BotTypes.TrainingDocument;



module.exports = function(RED) {
    function TalkifyNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.bot = new Bot();


        node.bot.trainAll([
            new TrainingDocument('how_are_you', 'how are you'),
            new TrainingDocument('how_are_you', 'how are you going'),
            new TrainingDocument('how_are_you', 'how is it going'),

            new TrainingDocument('help', 'how can you help'),
            new TrainingDocument('help', 'i need some help'),
            new TrainingDocument('help', 'how could you assist me')
        ], function() {});

        var howAction = function(context, request, response, next) {
            response.message = new SingleLineMessage('You asked: \"' + request.message.content +
                '\". I\'m doing well. Thanks for asking.');

            console.log(util.inspect(request));
            console.log(util.inspect(response));

            next();
        };

        var helpAction = function(context, request, response, next) {
            response.message = new SingleLineMessage('You asked: \"' + request.message.content +
                '\". I can tell you how I\'m doing if you ask nicely.');

            console.log(util.inspect(request));
            console.log(util.inspect(response));

            next();
        };

        var howSkill = new Skill('how_skill', 'how_are_you', howAction);
        var helpSkill = new Skill('help_skill', 'help', helpAction);

        node.bot.addSkill(howSkill);
        node.bot.addSkill(helpSkill);


        node.on('input', function(msg) {

            var respond = function(err, messages) {
                if(err) return console.error(err);

                return console.log(messages);
            };

            node.bot.resolve(123, msg.payload.toString(), respond);

            node.send(msg);
        });
    }
    RED.nodes.registerType("talkify",TalkifyNode);
}

