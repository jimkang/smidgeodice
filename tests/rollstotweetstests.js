var test = require('tape');
var createRollsToTweets = require('../rollstotweets');
var fixtures = require('./fixtures');

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

test('Convert roll results to tweet-sized text', function convertTests(t) {
  var results = [
    [
      {
        rolls: [6],
        total: 6,
        source: {
          "times": 1,
          "faces": 6,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": 0,
          "repeat": 1
        }
      }
    ],
    [
      {
        rolls: [4],
        total: 4,
        source: {
          "times": 1,
          "faces": 4,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": 0,
          "repeat": 1
        }
      }
    ],
    [
      {
        rolls: [6, 6, 6],
        total: 18,
        source: threed6source
      }
    ],
    [
      {
        rolls: [8, 8],
        total: 19,
        source: {
          "times": 2,
          "faces": 8,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": 3,
          "repeat": 1
        }
      }
    ],
    [
      {
        rolls: [20],
        total: 20,
        source: {
          "times": 1,
          "faces": 20,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": 0,
          "repeat": 1
        }
      }
    ],
    [
      {
        rolls: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
        total: 50,
        source: {
          "times": 10,
          "faces": 6,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": -10,
          "repeat": 1
        }        
      }
    ],
    [
      {
        rolls: [4],
        total: 4,
        source: {
          "times": 1,
          "faces": 4,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": 0,
          "repeat": 1
        }
      },
      {
        rolls: [20],
        total: 25,
        source: {
          "times": 1,
          "faces": 20,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": 5,
          "repeat": 1
        }
      }
    ],
    [
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
        rolls: fixtures.createRepeatArray(2, 24),
        total: 48,
        source: {
          "times": 24,
          "faces": 2,
          "keep": null,
          "lowest": false,
          "highest": false,
          "multiplier": 1,
          "modifier": 0,
          "repeat": 1
        }        
      }
    ]
  ];

  var inReplyToSets = [
    ['autocompleterap'],
    ['autocompleterap'],
    ['autocompleterap', 'translatedbible'],
    ['r0llb0t', 'autocompleterap', 'translatedbible'],
    ['wikisext', 'r0llb0t', 'autocompleterap', 'translatedbible'],
    ['hwaetbot', 'translatedbible'],
    ['hwaetbot', 'translatedbible', 'r0llb0t'],
    ['pokemon_ebooks']
  ];

  var expectedTweetSeries = [
    ['@autocompleterap 🐝\nd6: 6'],
    ['@autocompleterap 🐝\nd4: 4'],
    ['@autocompleterap @translatedbible 🐝\n3d6: 18'],
    ['@r0llb0t @autocompleterap @translatedbible 🐝\n2d8+3: 19'],
    ['@wikisext @r0llb0t @autocompleterap @translatedbible 🐝\nd20: 20'],
    ['@hwaetbot @translatedbible 🐝\n10d6-10: 50'],
    ['@hwaetbot @translatedbible @r0llb0t 🐝\nd4: 4\nd20+5: 25'],
    ['@pokemon_ebooks 🐝\n7d6: 42\nd100: 100\n20d12: 240\n24d2: 48']
  ];

  t.plan(16);

  var rollsToTweets = createRollsToTweets({
    getOneCharStamp: function mockGetStamp(date) {
      t.ok(!isNaN(date.getTime()), 'It passes the date to getOneCharStamp.');
      // A real getOneCharStamp implementation would acutally return different 
      // things here.
      return '🐝';
    }
  });

  for (var i = 0; i < 8; ++i) {
    t.deepEqual(
      rollsToTweets({
        results: results[i],
        inReplyTo: inReplyToSets[i],        
      }),
      expectedTweetSeries[i]
    );
  }
});

test('Error rolls', function errorResults(t) {
  t.plan(1);

  var facesError = new Error('I don\'t have a die with that many faces.');
  facesError.name = 'Not enough faces';

  var rollsToTweets = createRollsToTweets({
    getOneCharStamp: function mockGetStamp() {
      return '🐝';
    }
  });

  t.deepEqual(
    rollsToTweets({
      results: [
        {
          rolls: [6, 6, 6],
          total: 18,
          source: threed6source
        },
        {
          rolls: [],
          total: NaN,
          error: facesError
        },
        {
          rolls: [6, 6, 6],
          total: 18,
          source: threed6source
        }
      ],
      inReplyTo: ['autocompleterap', 'translatedbible']
    }),
    [
      '@autocompleterap @translatedbible 🐝\n3d6: 18\n[I don\'t have a die with that many faces.]\n3d6: 18'
    ],
    'Reports roll errors.'
  );
});