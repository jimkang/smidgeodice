var Twit = require('twit');
var config = require('./config');
var createAnswerTweet = require('./answertweet');
var createDiceCup = require('dicecup');
var emojiSource = require('emojisource');
var dividerPicker = require('./dividerpicker');

console.log('The smidgeodice server is running.');

var twit = new Twit(config.twitter);
// This is why prototypal inheritance sucks:
twit.post = twit.post.bind(twit);

var answerTweet = createAnswerTweet({
  logger: console,
  twit: twit,
  dicecup: createDiceCup({
    numberOfRollsLimit: 10000,
    numberOfFacesOnLargestDie: 50000
  }),
  getOneCharStamp: emojiSource.getRandomTopicEmoji,
  getDiceResultDivider: dividerPicker.pickDivider
});

var stream = twit.stream('user');

stream.on('tweet', function respondToTweet(tweet) {
  // TODO: Rate limit by user.
  answerTweet(tweet, function done(error) {
    if (error) {
      console.log(error);
    }
  });
});

