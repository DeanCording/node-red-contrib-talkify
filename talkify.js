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

        node.topics = config.topics || [];
	node.outputs = [];

        node.bot = new Bot();

        var trainingDocuments = [];

        node.topics.forEach(function(topic) {
            topic.phrases.split("\n").forEach(function (phrase) {
		if (phrase.length > 2) 
                    trainingDocuments.push(new TrainingDocument(topic.name, phrase));
            });
	    node.outputs.push(topic.name);
        });

	if (trainingDocuments.length > 0) {
            node.bot.trainAll(trainingDocuments, function() {});
        }

        var action = function(context, request, response, next) {

            var msg = request.id;
	    var msgs = new Array(node.outputs.length);

            if (request.skill.current.name == 'recognised') {
                msg.topic = request.skill.current.topic.name;
	        msg.confidence = request.skill.current.topic.confidence;
	    } else {
		msg.topic = 'unknown';
	    }

	    msgs[node.outputs.findIndex(function (output) { return output == msg.topic})] = msg;
            node.send(msgs);
            next();
        };


        node.topics.forEach(function(topic) {
          node.bot.addSkill(new Skill('recognised', topic.name, action),0.75)});


        node.bot.addSkill(new Skill('unknown', undefined, action));
	    
        node.outputs.push('unknown');

        node.on('input', function(msg) {

            var respond = function(err, messages) {
                if(err) return node.error(err,msg);
            };

            node.bot.resolve(msg, msg.payload.toString(), respond);

        });
    }
    RED.nodes.registerType("talkify",TalkifyNode);
}

