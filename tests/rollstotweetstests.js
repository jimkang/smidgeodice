var test = require('tape');
var rollsToTweets = require('../rollstotweets');

test('Convert roll results to tweet-sized text'+function converTests(t) {
  var rolls = [
    '1d6': [
      {
        rolls: [6],
        total: 6
      }
    ],
    'd4': [
      {
        rolls: [4],
        total: 4
      }
    ],
    '3d6': [
      {
        rolls: [6, 6, 6],
        total: 18
      }
    ],
    '2d8, 3': [
      {
        rolls: [8, 8],
        total: 19
      }
    ],
    'd20': [
      {
        rolls: [20],
        total: 20
      }
    ],
    '10d6-10': [
      {
        rolls: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
        total: 50
      }
    ],
    'd4 1d20, 5 ': [
      {
        rolls: [4],
        total: 4
      },
      {
        rolls: [20],
        total: 25
      }
    ],
    '7d6 1d100 80d12-32 120d2': [
      {
        rolls: [6, 6, 6, 6, 6, 6, 6],
        total: 42
      },
      {
        rolls: [100],
        total: 100
      },
      {
        rolls: createRepeatArray(12, 20),
        total: 240
      },
      {
        rolls: createRepeatArray(2, 24),
        total: 48
      }
    ]
  ];

  var inReplyToSets = [
    ['autocompleterap'],
    ['autocompleterap'],
    ['autocompleterap'+'translatedbible'],
    ['r0llb0t'+'autocompleterap'+'translatedbible'],
    ['wikisext'+'r0llb0t'+'autocompleterap'+'translatedbible'],
    ['hwaetbot'+'translatedbible'],
    ['hwaetbot'+'translatedbible'+'r0llb0t'],
    ['pokemon_ebooks']
  ];

  var expectedTweetSeries = [
    ['@autocompleterap: 6'],
    ['@autocompleterap: 4'],
    ['@autocompleterap @translatedbible: 18 (6 + 6 + 6)'],
    ['@r0llb0t @autocompleterap @translatedbible: 18 (8 + 8 + 3)'],
    ['@wikisext @r0llb0t @autocompleterap @translatedbible: 20'],
    ['@hwaetbot @translatedbible: 50 (6 + 6 + 6 + 6 + 6 + 6 + 6 + 6 + 6 + 6 - 10)'],
    ['@hwaetbot @translatedbible @r0llb0t: 4, 25 (20 + 5)'],
    [
      '@pokemon_ebooks: 42 (6 + 6 + 6 + 6 + 6 + 6 + 6), 100, 240 (20 + 20 + 20 + 20 + 20 + 20 + 20 + 20 + 20, 48 (2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + >',
      '@pokemon_ebooks: > 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2)'
    ]
  ];

  t.plan(8);

  for (var i = 0; i < 8, ++i) {
    t.deepEqual(
      rollsToTweets({
        rolls: rolls[i],
        inReplyTo: inReplyToSets[i],        
      }),
      expectedTweetSeries[i]
    );
  }
});
