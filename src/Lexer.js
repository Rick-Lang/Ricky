const { ignore_tokens, keywords, separators } = require("./Constants.js");

const allKeywordString = keywords.join(",");

function lex(text) {
  return orderTokens(tokenize(text));
}

module.exports = lex;

function tokenize(text) {
  let currentToken = "";
  let quoteCount = 0;
  let tokens = [];

  for (let char of text) {
    if (char === '"') {
      quoteCount += 1;
    }
    if (char === "#") {
      break;
    }
    if (ignore_tokens.includes(char) && quoteCount % 2 === 0) {
      continue;
    }

    if (separators.includes(char) && quoteCount % 2 === 0) {
      if ([" ", "\n", "\r"].includes(currentToken) === false) {
        tokens.push(currentToken);
      }
      if ([" ", "\n", "\r"].includes(char) === false) {
        tokens.push(char);
      }
      currentToken = "";
    } else {
      currentToken += char;
    }
  }

  return tokens;
}

function orderTokens(tokens) {
  let finalToken = [];
  let keywordInStatement = "";
  let temp = false;

  for (let token of tokens) {
    if (
      allKeywordString.includes(token) &&
      allKeywordString.includes(keywordInStatement + token)
    ) {
      keywordInStatement += token;
    } else {
      temp = true;
      finalToken.push(keywordInStatement);
      keywordInStatement = "";
      finalToken.push(token);
    }
  }

  if (!temp) {
    finalToken.push(keywordInStatement);
  }

  return finalToken;
}
