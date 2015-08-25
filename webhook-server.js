var config = require('./config');
var createDiceCup = require('dicecup');
var emojiSource = require('emojisource');
var dividerPicker = require('./dividerpicker');
var http = require('http');
var createRollsToTweets = require('./rollstotweets');
var qs = require('qs');

console.log('The smidgeodice webhook server is running.');

var dicecup = createDiceCup({
  numberOfRollsLimit: 10000,
  numberOfFacesOnLargestDie: 50000
});

var rollsToTweets = createRollsToTweets({
  getOneCharStamp: emojiSource.getRandomTopicEmoji,
  getDiceResultDivider: dividerPicker.pickDivider
});

function takeRequest(req, res) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end('OK');
  }
  else if (req.method === 'POST') {
  // else if ('content-type' in req.headers && req.method === 'POST' &&
  //   req.headers['content-type'].toLowerCase()
  //   .indexOf('application/json') === 0) {

    var body = '';

    req.on('data', function (data) {
      body += data;
    });

    req.on('end', function doneReadingData() {
      respondToRequestWithBody(req, body, res, headers);
    });
  }
  else {
    res.writeHead(304, headers);
    res.end();
  }
}

function respondToRequestWithBody(req, body, res, headers) {
  headers['Content-Type'] = 'text/json';

  try {
    var params = qs.parse(body);

    if (config.validWebhookTokens.indexOf(params.token) === -1) {
      res.writeHead(404);
      res.end();
    }
    else {
      var outcomes = dicecup.roll(params.text);
      var responseText;

      var response = {
        username: 'smidgeodice',
        channel: params.channel_id
      };

      if (outcomes.length > 0 && outcomes.some(defined)) {
        var replyTexts = rollsToTweets({
          results: outcomes,
          inReplyTo: [params.user_name]
        });
        response.text = replyTexts.join(' ');
      }
      else {
        response.text = 'where is dice';
        response.attachments = [
          {
            fallback: 'Zuh?',
            image_url: 'https://dl.dropboxusercontent.com/u/263768/bonus-confused.jpg'
          }
        ];
      }

      res.writeHead(200, headers);
      res.end(JSON.stringify(response));
    }
  }
  catch (e) {
    console.log(e);
    res.writeHead(200, headers);
    res.end();
  }  
}


function defined(value) {
  return value !== undefined;
}

http.createServer(takeRequest).listen(config.webhookPort);

console.log('Webhook server listening at port:', config.webhookPort);
