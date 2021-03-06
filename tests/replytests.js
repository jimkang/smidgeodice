var test = require('tape');
var createAnswerTweet = require('../answertweet');
var fixtures = require('./fixtures');
var conformAsync = require('conform-async');
var createDiceCup = require('dicecup');
var jsonfile = require('jsonfile');

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

function mockGetDiceResultDivider(date) {
  return ' 💨 ';
}


test('Avoid replying to self-tweets', function selfTweets(t) {
  t.plan(1);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'smidgeodice'
  };

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {
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

test('Avoid replying to informal retweets of self', function classicRT(t) {
  t.plan(2);

  var tweet = createMockTweet();
  tweet.text = 'RT @smidgeodice: 3d6: 5\n1d4: 4';

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

test('Avoid replying to formal retweets of self', function retweetOfSelf(t) {
  t.plan(2);

  var tweet = createMockTweet();
  tweet.retweeted_status = {
    user: {
      screen_name: 'smidgeodice'
    }
  };

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {
        t.equal(message, 'Retweet: Not replying.', 
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

test('Avoid replying to retweets of others', function selfTweets(t) {
  t.plan(2);

  var tweet = createMockTweet();
  tweet.retweeted_status = {
    user: {
      screen_name: 'deathmtn'
    }
  };

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {
        t.equal(message, 'Retweet: Not replying.', 
          'Logs that it doesn\'t reply to retweets.'
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

test('Don\'t reply to unrelated tweets.', function unrelated(t) {
  t.plan(1);

  var tweet = jsonfile.readFileSync(__dirname + '/data/unrelatedtweet.json');

  var answerTweet = createAnswerTweet({
    twit: {
      post: function mockPost(opts) {
        t.fail('Does not call twit.post.');
      }
    },
    dicecup: {
      roll: function mockRoll() {
        t.fail('Does not call dicecup.roll.');
      }
    }
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

var threed6source = {
  "times": 3,
  "faces": 6,
  "keep": null,
  "lowest": false,
  "highest": false,
  "multiplier": 1,
  "modifier": 0,
  "repeat": 1
};

test('Reply with results', function normalSizedResults(t) {
  t.plan(3);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'deathmtn'
  };
  tweet.text = '@smidgeodice 3d6 3d6 3d6 3d6 3d6 3d6'

  var answerTweet = createAnswerTweet({
    dicecup: {
      roll: function mockRoll() {
        return [
          {
            rolls: [6, 6, 6],
            total: 18,
            source: threed6source
          },
          {
            rolls: [6, 6, 6],
            total: 18,
            source: threed6source
          },      
          {
            rolls: [6, 6, 6],
            total: 18,
            source: threed6source
          },      
          {
            rolls: [6, 6, 6],
            total: 18,
            source: threed6source
          },      
          {
            rolls: [6, 6, 6],
            total: 18,
            source: threed6source
          },      
          {
            rolls: [6, 6, 6],
            total: 18,
            source: threed6source
          }
        ];
      }
    },
    twit: {
      post: function mockPost(endpoint, opts, done) {
        t.equal(endpoint, 'statuses/update', 'Posts an update');
        t.equal(
          opts.status, 
          '@deathmtn 🐙\n3d6 💨 18\n3d6 💨 18\n3d6 💨 18\n3d6 💨 18\n3d6 💨 18\n3d6 💨 18',
          'Puts the die rolls in the tweet.'
        )
        conformAsync.callBackOnNextTick(done);
      }
    },
    getOneCharStamp: mockGetStamp,
    getDiceResultDivider: mockGetDiceResultDivider
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Reply multiple times with long results', function largeSizedResults(t) {
  t.plan(4);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'pokemon_ebooks'
  };
 tweet.text = '@smidgeodice (the real tweet text would have dice in it)';

  var postCallNumber = 0;

  var answerTweet = createAnswerTweet({
    dicecup: {
      roll: function mockRoll() {
        return [
          {
            rolls: [6, 6, 6, 6, 6, 6, 6],
            total: 42,
            source: {
              "times": 7,
              "faces": 6,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            rolls: [100],
            total: 100,
            source: {
              "times": 1,
              "faces": 100,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            rolls: fixtures.createRepeatArray(12, 20),
            total: 240,
            source: {
              "times": 20,
              "faces": 12,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            total: 1342342343,
            // Just for testing: This couldn't actually generate that total.
            source: {
              "times": 38,
              "faces": 420,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            total: 9089887979879,
            // Just for testing: This couldn't actually generate that total.
            source: {
              "times": 97,
              "faces": 2545,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }            
          },
          {
            total: 1342342343,
            source: {
              "times": 38,
              "faces": 420,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            total: 9089887979879,
            source: {
              "times": 97,
              "faces": 2545,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }            
          },
          {
            total: 1342342343,
            source: {
              "times": 38,
              "faces": 420,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            total: 9089887979879,
            source: {
              "times": 97,
              "faces": 2545,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }            
          },
          {
            total: 1342342343,
            source: {
              "times": 38,
              "faces": 420,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            total: 9089887979879,
            source: {
              "times": 97,
              "faces": 2545,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }            
          },
          {
            total: 1342342343,
            source: {
              "times": 38,
              "faces": 420,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          },
          {
            total: 9089887979879,
            source: {
              "times": 97,
              "faces": 2545,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }            
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
              '@pokemon_ebooks 🐙\n7d6 💨 42\nd100 💨 100\n20d12 💨 240\n38d420 💨 1342342343\n97d2545 💨 9089887979879\n38d420 💨 1342342343\n >',
              'The first tweet posted is correct.'
            );
            break;
          case 1:
            t.equal(
              opts.status,
              '@pokemon_ebooks 🐙\n> 97d2545 💨 9089887979879\n38d420 💨 1342342343\n97d2545 💨 9089887979879\n38d420 💨 1342342343\n >',
              'The second tweet posted is correct.'
            );
            break;
          case 2:
            t.equal(
              opts.status,
              '@pokemon_ebooks 🐙\n> 97d2545 💨 9089887979879\n38d420 💨 1342342343\n97d2545 💨 9089887979879',
              'The third tweet posted is correct.'
            );
            break;
        }
        postCallNumber += 1;
        conformAsync.callBackOnNextTick(done);
      }
    },
    getOneCharStamp: mockGetStamp,
    getDiceResultDivider: mockGetDiceResultDivider
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
  tweet.text = '@smidgeodice @deathmtn d20!!!';

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {}
    },    
    twit: {
      post: function mockPost(opts) {}
    },
    dicecup: {
      roll: function mockRoll(diceString) {
        t.equal(diceString.indexOf('@'), -1, 'It does not send @names to cup.');
        return [];
      }
    },
    getOneCharStamp: mockGetStamp,
    getDiceResultDivider: mockGetDiceResultDivider
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});

test('Big request', function bigRequest(t) {
  t.plan(2);

  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'autocompleterap'
  };
  tweet.text = '@smidgeodice 34532452345d56, 3d6,3d6,3d6,3d6,3d6,3d6,';

  var answerTweet = createAnswerTweet({
    logger: {
      log: function mockLog(message) {}
    },    
    twit: {
      post: function mockPost(endpoint, opts, done) {
        conformAsync.callBackOnNextTick(done);
      }
    },
    // Using an actual dicecup for this test.
    dicecup: createDiceCup({
      numberOfRollsLimit: 10000,
      numberOfFacesOnLargestDie: 50000
    }),
    getOneCharStamp: mockGetStamp,
    getDiceResultDivider: mockGetDiceResultDivider
  });

  t.doesNotThrow(function callAnswer() {
    answerTweet(tweet, function done(error) {
      t.ok(!error, 'It does not call back with an error.');
    });
  },
  'Handles absurd request without throwing.');
});

test('Set in_reply_to_status_id', function setInReplyTo(t) {
  t.plan(2);
  
  var tweet = createMockTweet();
  tweet.user = {
    screen_name: 'deathmtn'
  };
  tweet.text = '@smidgeodice 1d12'

  var answerTweet = createAnswerTweet({
    dicecup: {
      roll: function mockRoll() {
        return [
          {
            rolls: [12],
            total: 12,
            source: {
              "times": 1,
              "faces": 12,
              "keep": null,
              "lowest": false,
              "highest": false,
              "multiplier": 1,
              "modifier": 0,
              "repeat": 1
            }
          }
        ];
      }
    },
    twit: {
      post: function mockPost(endpoint, opts, done) {
        t.equal(
          opts.in_reply_to_status_id, tweet.id_str,
          'Sets the in_reply_to_status_id field.'
        )
        conformAsync.callBackOnNextTick(done);
      }
    },
    getOneCharStamp: mockGetStamp,
    getDiceResultDivider: mockGetDiceResultDivider
  });

  answerTweet(tweet, function done(error) {
    t.ok(!error, 'It does not call back with an error.');
  });
});
