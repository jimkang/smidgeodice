var continuationMarksLength = ' >'.length;
var spaceAfterUserRefsLength = ' '.length;
var oneCharStampPlusSpaceLength = 2;

var maxTweetLength = 140 - spaceAfterUserRefsLength - continuationMarksLength 
  - oneCharStampPlusSpaceLength;

function createRollsToTweets(constructorOpts) {
  var getOneCharStamp = constructorOpts.getOneCharStamp;

  function rollsToTweets(opts) {
    var userRefs = opts.inReplyTo.map(atIt);
    var userRefText = userRefs.join(' ');
    // The point of the one char stamp (which is hopefully somewhat unique) is 
    // to make it possible to tweet repeat results multiple times.
    var prefixText = userRefText + ' ' + getOneCharStamp(new Date());

    var body = '';
    var resultTexts = opts.results.map(textifyRollResult);
    if (resultTexts.length > 1) {
      body += resultTexts.join(', ');
    }
    else {
      body += resultTexts[0];
    }

    if (body.length <= maxTweetLength - prefixText.length) {
      return [prefixText + ' ' + body];
    }
    else {
      var words = body.split(/\s/);
      var tweetTexts = [];
      var currentTweetText = prefixText;

      // Assumption: No words are themselves over maxTweetTextLength!
      words.forEach(function appendToTweetText(word) {
        if (currentTweetText.length + word.length + 1 > maxTweetLength) {
          currentTweetText += ' >';
          tweetTexts.push(currentTweetText);
          // Start a new tweet.
          currentTweetText = prefixText + ' >';
        }
        currentTweetText += (' ' + word);
      });

      tweetTexts.push(currentTweetText);
      return tweetTexts;
    }
  }

  return rollsToTweets;
}

function atIt(str) {
  return '@' + str;
}

function textifyRollResult(result) {
  var text;

  if (result.error) {
    text = '[' + result.error.message + ']';
  }
  else {
    text = result.total;

    // if (result.rolls.length > 1) {
    //   text += ' (';
    //   text += result.rolls.join(' + ');
    //   text += ')';
    // }
  }

  return text;
}

module.exports = createRollsToTweets;
