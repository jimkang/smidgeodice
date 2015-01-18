var continuationMarksLength = ' >'.length;
var spaceAfterUserRefsLength = ' '.length;
var oneCharStampPlusSpaceLength = 2;

var maxTweetLength = 140 - spaceAfterUserRefsLength - 
  continuationMarksLength - oneCharStampPlusSpaceLength;

function createRollsToTweets(constructorOpts) {
  var getOneCharStamp = constructorOpts.getOneCharStamp;

  function rollsToTweets(opts) {
    var userRefs = opts.inReplyTo.map(atIt);
    var userRefText = userRefs.join(' ');
    // The point of the one char stamp (which is hopefully somewhat unique) is 
    // to make it possible to tweet repeat results multiple times.
    var prefixText = userRefText + ' ' + getOneCharStamp(new Date()) + '\n';

    var resultTexts = opts.results.map(textifyRollResult);

    var tweetTexts = [];
    var currentTweetText = prefixText;

    // Assumption: No resultTexts are themselves over maxTweetTextLength!
    resultTexts.forEach(function appendToTweetText(resultText, i) {
      if (currentTweetText.length + resultText.length + 1 > maxTweetLength) {
        currentTweetText += ' >';
        tweetTexts.push(currentTweetText);
        // Start a new tweet.
        currentTweetText = prefixText + '> ';
      }
      currentTweetText += resultText;

      // Put a line break after each group except for the last one.
      if (i !== resultTexts.length - 1) {
        currentTweetText += '\n';
      }
    });

    tweetTexts.push(currentTweetText);
    return tweetTexts;
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
    text = formatRollSource(result.source) + ' ⇒ ';
    text += result.total;

    // if (result.rolls.length > 1) {
    //   text += ' (';
    //   text += result.rolls.join(' + ');
    //   text += ')';
    // }
  }

  return text;
}

// Based on node-dice-js's format function.
function formatRollSource(source) {
  if (!source || typeof source !== 'object') {
    return '???';
  }

  var text = '';

  // add the number of dice to be rolled, if it more than one.
  if (source.times && source.times > 1) {
    text += source.times;
  }

  // add the number of faces
  text += (source.faces) ? 'd' + source.faces : 'd' + 20;

  // add the modifier
  if (source.modifier && source.modifier > 0) {
    text += '+' + source.modifier;
  }
  else if (source.modifier) {
    text += source.modifier;
  }

  return text;
}

module.exports = createRollsToTweets;
