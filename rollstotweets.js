var maxTweetLength = 140;

function rollsToTweets(opts) {
  var userRefs = opts.inReplyTo.map(atIt);
  var userRefText = userRefs.join(' ');
  userRefText += ' ';

  var body = '';
  var resultTexts = opts.results.map(textifyRollResult);
  if (resultTexts.length > 1) {
    body += resultTexts.join(', ');
  }
  else {
    body += resultTexts[0];
  }

  if (body.length <= maxTweetLength - userRefText.length) {
    return [userRefText + body];
  }
  else {
    var maxBodySegmentLength = maxTweetLength - userRefText.length - 4;
    var regex = new RegExp('.{1,' + maxBodySegmentLength + '}', 'g');
    var bodies = body.match(regex);

    return bodies.map(function ornamentBody(body, i) {
      var ornamented = body.trim();

      if (i !== bodies.length - 1) {
        ornamented = ornamented + ' >';
      }
      if (i !== 0) {
        ornamented = '> ' + ornamented;
      }

      return userRefText + ornamented;
    });
  }
}

function atIt(str) {
  return '@' + str;
}

function textifyRollResult(result) {
  var text = result.total;

  if (result.rolls.length > 1) {
    text += ' (';
    text += result.rolls.join(' + ');
    text += ')';
  }

  return text;
}

module.exports = rollsToTweets;
