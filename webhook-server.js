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
  console.log('body', body);
  try {
    // webhooktweeter.reportCommitsFromPayload(JSON.parse(body));
    var params = qs.parse(body);

    var outcomes = dicecup.roll(params.text);
    var replyTexts;

    if (outcomes.some(defined)) {
      replyTexts = rollsToTweets({
        results: outcomes,
        inReplyTo: [params.user_name]
      });
    }
    var responseText = replyTexts.join('\n');
    res.end(responseText);
  }
  catch (e) {
    console.log(e);
  }
  
  res.writeHead(200, headers);
  res.end();
}


function defined(value) {
  return value !== undefined;
}

http.createServer(takeRequest).listen(config.webhookPort);

console.log('Webhook server listening at port:', config.webhookPort);
