var conformAsync = require('conform-async');
var betterKnow = require('better-know-a-tweet');
var createRollsToTweets = require('./rollstotweets');
var queue = require('queue-async');

function createAnswerTweet(constructorOpts) {
  var logger = constructorOpts.logger;
  var twit = constructorOpts.twit;
  var dicecup = constructorOpts.dicecup;
  var rollsToTweets = createRollsToTweets({
    getOneCharStamp: constructorOpts.getOneCharStamp
  });

  function answerTweet(tweet, done) {
    if (betterKnow.isTweetOfUser('smidgeodice', tweet)) {
      // logger.log('Self-tweet: Not replying.');
      conformAsync.callBackOnNextTick(done, null, '');
      return;
    }
    else if (betterKnow.isRetweetOfUser('smidgeodice', tweet)) {
      logger.log('Retweet of self: Not replying.');
      conformAsync.callBackOnNextTick(done, null, '');
      return;
    }

    var outcomes = dicecup.roll(stripMentionsFromText(tweet.text));

    if (outcomes.some(defined)) {
      var replyToUsers = removeSelfFromUserList(
        betterKnow.whosInTheTweet(tweet)
      );
      var tweetTexts = rollsToTweets({
        results: outcomes,
        inReplyTo: replyToUsers
      });

      var q = queue(1);
      
      tweetTexts.forEach(function queuePost(text) {
        q.defer(
          twit.post,
          'statuses/update',
          {
            status: text
          }
        );
      });

      q.awaitAll(done);
    }
    else {
      conformAsync.callBackOnNextTick(done, null, '');
    }
  }

  return answerTweet;
}

function defined(value) {
  return value !== undefined;
}

function removeSelfFromUserList(users) {
  return users.filter(usernameIsNotRollb0t);
}

function usernameIsNotRollb0t(username) {
  return username.toLowerCase() !== 'smidgeodice';
}

function stripMentionsFromText(text) {
  return text.replace(/@\w+/g, '');
}

module.exports = createAnswerTweet;
