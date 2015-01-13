var test = require('tape');
var createAnswerTweet = require('../answertweet');

function createMockTweet() {
  return {
    id_str: '345902834534509845',
    user: {
      id: 109384538345983456
    },
    text: '15 (6+3+6)'
  };
}

test('Avoid replying to self-tweets', function selfTweets(t) {
  t.plan(2);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'r0llb0t'
  };

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {
        t.equal(message, 'Self-tweet: Not replying.', 
          'Logs that it doesn\'t reply to own tweets.'
        );
      }
    },
    twit: {
      post: function mockPost(opts) {
        t.fail('Does not call twit.post.');
      }
    }
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Avoid replying to retweets', function selfTweets(t) {
  t.plan(2);

  var tweet = createMockTweet();
  tweet.retweeted_status = {
    user: {
      screen_name: 'r0llb0t'
    }
  };

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {
        t.equal(message, 'Retweet of self: Not replying.', 
          'Logs that it doesn\'t reply to retweets of itself.'
        );
      }
    },
    twit: {
      post: function mockPost(opts) {
        t.fail('Does not call twit.post.');
      }
    }
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Don\'t reply with if there\'s no results', function noResults(t) {
  t.plan(1);

  var tweet = createMockTweet();

  var answerTweet = createAnswerTweet({
    twit: {
      post: function mockPost(opts) {
        t.fail('Does not call twit.post.');
      }
    },
    dicecup: {
      roll: function mockRoll() {
        return [undefined];
      }
    }
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Reply with results', function normalSizedResults(t) {
  t.plan(3);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'deathmtn'
  };
  tweet.text = '@r0llb0t 3d6 3d6 3d6 3d6 3d6 3d6'

  var answerTweet = createAnswerTweet({
    dicecup: {
      roll: function mockRoll() {
        return [
          {
            rolls: [6, 6, 6],
            total: 18
          },
          {
            rolls: [6, 6, 6],
            total: 18
          },      
          {
            rolls: [6, 6, 6],
            total: 18
          },      
          {
            rolls: [6, 6, 6],
            total: 18
          },      
          {
            rolls: [6, 6, 6],
            total: 18
          },      
          {
            rolls: [6, 6, 6],
            total: 18
          }
        ];
      }
    },
    twit: {
      post: function mockPost(endpoint, opts, done) {
        // t.fail('Does not call twit.post.');
        t.equal(endpoint, 'statuses/update', 'Posts an update');
        t.equal(
          opts.status, 
          '@deathmtn 18 (6+6+6) 18 (6+6+6) 18 (6+6+6) 18 (6+6+6) 18 (6+6+6) 18 (6+6+6)',
          'Puts the die rolls in the tweet.'
        )
      }
    },
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Reply multiple times with long results');
