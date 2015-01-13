var conformAsync = require('conform-async');
var betterKnow = require('better-know-a-tweet');

function createAnswerTweet(constructorOpts) {
  var logger = constructorOpts.logger;
  var twit = constructorOpts.twit;
  var dicecup = constructorOpts.dicecup;

  function answerTweet(tweet, done) {
    if (betterKnow.isTweetOfUser('r0llb0t', tweet)) {
      logger.log('Self-tweet: Not replying.');
      conformAsync.callBackOnNextTick(done, null, '');
      return;
    }
    else if (betterKnow.isRetweetOfUser('r0llb0t', tweet)) {
      logger.log('Retweet of self: Not replying.');
      conformAsync.callBackOnNextTick(done, null, '');
      return;
    }

    var outcomes = dicecup.roll(tweet.text);
    if (outcomes.some(defined)) {
      twit.post
    }
  }

  return answerTweet;
}

function defined(value) {
  return value !== undefined;
}

module.exports = createAnswerTweet;
