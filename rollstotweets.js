var continuationMarksLength = ' >'.length;
var spaceAfterUserRefsLength = ' '.length;
var maxTweetLength = 140 - spaceAfterUserRefsLength - continuationMarksLength;

function rollsToTweets(opts) {
  var userRefs = opts.inReplyTo.map(atIt);
  var userRefText = userRefs.join(' ');

  var body = '';
  var resultTexts = opts.results.map(textifyRollResult);
  if (resultTexts.length > 1) {
    body += resultTexts.join(', ');
  }
  else {
    body += resultTexts[0];
  }

  if (body.length <= maxTweetLength - userRefText.length) {
    return [userRefText + ' ' + body];
  }
  else {
    // var regex = new RegExp('.{1,' + maxBodySegmentLength + '}', 'g');
    // var bodies = body.match(regex);
    var words = body.split(/\s/);
    var tweetTexts = [];
    var currentTweetText = userRefText;

    // Assumption: No words are themselves over maxTweetTextLength!
    words.forEach(function appendToTweetText(word) {
      if (currentTweetText.length + word.length + 1 > maxTweetLength) {
        currentTweetText += ' >';
        tweetTexts.push(currentTweetText);
        // Start a new tweet.
        currentTweetText = userRefText + ' >';
      }
      currentTweetText += (' ' + word);
    });

    tweetTexts.push(currentTweetText);
    return tweetTexts;
  }
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

module.exports = rollsToTweets;
