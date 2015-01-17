var test = require('tape');
var rollsToTweets = require('../rollstotweets');
var fixtures = require('./fixtures');

test('Convert roll results to tweet-sized text', function convertTests(t) {
  var results = [
    [
      {
        rolls: [6],
        total: 6
      }
    ],
    [
      {
        rolls: [4],
        total: 4
      }
    ],
    [
      {
        rolls: [6, 6, 6],
        total: 18
      }
    ],
    [
      {
        rolls: [8, 8],
        total: 19
      }
    ],
    [
      {
        rolls: [20],
        total: 20
      }
    ],
    [
      {
        rolls: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
        total: 50
      }
    ],
    [
      {
        rolls: [4],
        total: 4
      },
      {
        rolls: [20],
        total: 25
      }
    ],
    [
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
        rolls: fixtures.createRepeatArray(2, 24),
        total: 48
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
    ['@autocompleterap 6'],
    ['@autocompleterap 4'],
    ['@autocompleterap @translatedbible 18 (6 + 6 + 6)'],
    ['@r0llb0t @autocompleterap @translatedbible 19 (8 + 8)'],
    ['@wikisext @r0llb0t @autocompleterap @translatedbible 20'],
    ['@hwaetbot @translatedbible 50 (6 + 6 + 6 + 6 + 6 + 6 + 6 + 6 + 6 + 6)'],
    ['@hwaetbot @translatedbible @r0llb0t 4, 25'],
    [
      '@pokemon_ebooks 42 (6 + 6 + 6 + 6 + 6 + 6 + 6), 100, 240 (12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 + 12 >',
      '@pokemon_ebooks > + 12 + 12 + 12 + 12), 48 (2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2)'
    ]
  ];

  t.plan(8);

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

  t.deepEqual(
    rollsToTweets({
      results: [
        {
          rolls: [6, 6, 6],
          total: 18
        },
        {
          rolls: [],
          total: NaN,
          error: facesError
        },
        {
          rolls: [6, 6, 6],
          total: 18
        }
      ],
      inReplyTo: ['autocompleterap', 'translatedbible']
    }),
    [
      '@autocompleterap @translatedbible 18 (6 + 6 + 6), [I don\'t have a die with that many faces.], 18 (6 + 6 + 6)'
    ],
    'Reports roll errors.'
  );
});