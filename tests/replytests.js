var test = require('tape');
var createAnswerTweet = require('../answertweet');
var fixtures = require('./fixtures');
var conformAsync = require('conform-async');

function createMockTweet() {
  return {
    id_str: '345902834534509845',
    user: {
      id: 109384538345983456
    },
    text: '15 (6+3+6)'
  };
}

function mockGetStamp(date) {
  return '🐙';
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
        t.equal(endpoint, 'statuses/update', 'Posts an update');
        t.equal(
          opts.status, 
          '@deathmtn 🐙 18, 18, 18, 18, 18, 18',
          'Puts the die rolls in the tweet.'
        )
        conformAsync.callBackOnNextTick(done);
      }
    },
    getOneCharStamp: mockGetStamp
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Reply multiple times with long results', function largeSizedResults(t) {
  t.plan(3);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'pokemon_ebooks'
  };

  var postCallNumber = 0;

  var answerTweet = createAnswerTweet({
    dicecup: {
      roll: function mockRoll() {
        return [
          {
            rolls: [6, 6, 6, 6, 6, 6, 6],
            total: 42
          },
          {
            rolls: [100],
            total: 100
          },
          {
            rolls: fixtures.createRepeatArray(12, 20),
            total: 240
          },
          {
            total: 1342342343
          },
          {
            total: 9089887979879
          },
          {
            total: 1342342343
          },
          {
            total: 9089887979879
          },
          {
            total: 1342342343
          },
          {
            total: 9089887979879
          },
          {
            total: 1342342343
          },
          {
            total: 9089887979879
          },
          {
            total: 1342342343
          },
          {
            total: 9089887979879
          }          
        ];
      }
    },
    twit: {
      post: function mockPost(endpoint, opts, done) {
        switch (postCallNumber) {
          case 0:
            t.equal(
              opts.status, 
              '@pokemon_ebooks 🐙 42, 100, 240, 1342342343, 9089887979879, 1342342343, 9089887979879, 1342342343, 9089887979879, 1342342343, >',
              'The first tweet posted is correct.'
            );
            break;
          case 1:
            t.equal(
              opts.status, 
              '@pokemon_ebooks 🐙 > 9089887979879, 1342342343, 9089887979879',
              'The second tweet posted is correct.'
            );
            break;
        }
        postCallNumber += 1;
        conformAsync.callBackOnNextTick(done);
      }
    },
    getOneCharStamp: mockGetStamp
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Do not pass @names to dicecup', function noAtNamesForDiceCup(t) {
  t.plan(2);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'autocompleterap'
  };
  tweet.text = '@r0llb0t @deathmtn d20!!!';

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {}
    },    
    twit: {
      post: function mockPost(opts) {}
    },
    dicecup: {
      roll: function mockRoll(diceString) {
        debugger;
        t.equal(diceString.indexOf('@'), -1, 'It does not send @names to cup.');
        return [];
      }
    },
    getOneCharStamp: mockGetStamp    
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

