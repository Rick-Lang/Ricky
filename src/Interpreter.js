const {
  keywords,
  KW_assign,
  KW_break,
  KW_def,
  KW_end,
  KW_endless_loop,
  KW_greater_or_equals_OP,
  KW_if,
  KW_let,
  KW_main,
  KW_print,
  OP_build_in_functions,
  operators,
  TT_build_in_funcs,
  TT_float,
  TT_function,
  TT_identifier,
  TT_int,
  TT_keyword,
  TT_operator,
  TT_string,
} = require("./Constants.js");
const fs = require("fs");
const lex = require("./Lexer.js");

let currentCodeLevel = 0;
let executionCodeLevel = 0;

let inLoop = false;
let inLoopStatements = [];

let whileCondition = false;

let currentLine = 0;

let variables = [];

let functions = [];
let functionName = "";
let functionContent = [];
let inFunction = false;

function typeOf(string) {
  if ((string.match(/"/g) || []).length === 2) {
    return "string";
  }

  if (string.match(/^[0-9]+$/)) {
    return "int";
  } else if (string.match(/^[0-9]+\.[0-9]+$/)) {
    return "float";
  }
}

class Token {
  constructor(rawTokens) {
    this.tokens = [];
    this.types = [];
    this.lastKeyword = "";

    for (let token of rawTokens) {
      if (token) {
        this.makeToken(token);
      }
    }
  }
  makeToken(token) {
    this.tokens.push(token);
    if (keywords.includes(token)) {
      this.types.push(TT_keyword);
    } else if (operators.includes(token)) {
      this.types.push(TT_operator);
    } else if (OP_build_in_functions.includes(token)) {
      this.types.push(TT_build_in_funcs);
    } else if (typeOf(token) === "int") {
      this.types.push(TT_int);
    } else if (typeOf(token) === "float") {
      this.types.push(TT_float);
    } else if (typeOf(token) === "string") {
      this.types.push(TT_string);
    } else if (this.lastKeyword === KW_def) {
      this.types.push(TT_function);
    } else {
      this.types.push(TT_identifier);
    }
    this.lastKeyword = token;
  }
}

class Eval {
  constructor(tokens, types) {
    this.tokens = tokens;
    this.types = types || [];
    this.values = [];

    this.evaluate(this.tokens);
  }

  precedence(operator) {
    if (["+", "-"].includes(operator)) {
      return 3;
    } else if (["*", "/"].includes(operator)) {
      return 4;
    } else if (["^^"].includes(operator)) {
      return 5;
    } else if (["<<", ">>", ">>>"].includes(operator)) {
      return 2;
    } else if (["&", "|", ">?", "^"].includes(operator)) {
      return 1;
    }

    return 0;
  }

  applyOp(first, last, operator) {
    if (operator === "+") {
      return first + last;
    }
    if (operator === "-") {
      return first - last;
    }
    if (operator === "*") {
      return first * last;
    }
    if (operator === "/") {
      return first / last;
    }
    if (operator === "^^") {
      return Math.pow(first, last);
    }
    if (operator === "%") {
      return first % last;
    }
    if (operator === "<<") {
      return first << last;
    }
    if (operator === ">>") {
      return first >> last;
    }
    if (operator === "&") {
      return first & last;
    }
    if (operator === "|") {
      return first | last;
    }
    if (operator === ">?") {
      return ~last;
    }
    if (operator === "^") {
      return first ^ last;
    }
    if (operator === ">>>") {
      return first >>> last;
    }
    if (
      (operator === "is" && first === last) ||
      (operator === "isnot" && first !== last) ||
      (operator === "isgreaterthan" && first > last) ||
      (operator === "islessthan" && first < last) ||
      (operator === KW_greater_or_equals_OP && first >= last)
    ) {
      return "TrueLove";
    } else {
      return "FalseLove";
    }
  }

  evaluate(tokens) {
    let ops = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === "(") {
        ops.push(tokens[i]);
      } else if (!isNaN(Number(tokens[i]))) {
        this.values.push(Number(tokens[i]));
      } else if (this.types[i] === TT_identifier) {
        let varValue = variables[tokens[i]];
        this.values.push(isNaN(Number(varValue)) ? varValue : Number(varValue));
      } else if (
        tokens[i][0] === '"' &&
        tokens[i][tokens[i].length - 1] === '"'
      ) {
        this.values.push(tokens[i].slice(1, tokens[i].length - 1));
      } else if (tokens[i] === ")") {
        while (ops && ops[ops.length - 1] !== "(") {
          let value2 = this.values.pop();
          let value1 = this.values.pop();
          let op = ops.pop();

          this.values.push(this.applyOp(value1, value2, op));
        }
        ops.pop();
      } else {
        while (
          ops &&
          this.precedence(tokens[i]) <= this.precedence(ops[ops.length - 1])
        ) {
          let value2 = this.values.pop();
          let value1 = this.values.pop();
          let op = ops.pop();

          this.values.push(this.applyOp(value1, value2, op));
        }
        ops.push(tokens[i]);
      }
    }
    while (ops.length !== 0) {
      let value2 = this.values.pop();
      let value1 = this.values.pop();
      let op = ops.pop();

      this.values.push(this.applyOp(value1, value2, op));
    }
  }

  toStr() {
    return this.values[this.values.length - 1];
  }
}

class Interpreter {
  constructor(types, tokens) {
    this.tokens = tokens;
    this.types = types;

    if ([TT_keyword, TT_identifier].includes(this.types[0])) {
      this.runCode(this.tokens[0]);
    }
    if (this.types[0] === TT_identifier) {
      this.runFunction(this.tokens[0]);
    }
  }

  indent() {
    currentCodeLevel += 1;
    executionCodeLevel += 1;
  }

  runCode(keyword) {
    if (keyword === KW_end) {
      let runLoop = false;

      if (executionCodeLevel === currentCodeLevel) {
        executionCodeLevel -= 1;

        if (inFunction) {
          functions[functionName] = functionContent;
          inFunction = false;
          functionContent = [];
        }

        if (inLoop) {
          inLoop = false;
          runLoop = true;
        }
      }
      currentCodeLevel -= 1;

      if (runLoop) {
        while (whileCondition) {
          for (let statements of inLoopStatements) {
            new Interpreter(statements[0], statements[1]);
          }
        }
      }
    }
    if (inFunction) {
      functionContent.push([this.types, this.tokens]);
      return;
    }
    if (executionCodeLevel !== currentCodeLevel) {
      return;
    }
    if (inLoop) {
      inLoopStatements.push([this.types, this.tokens]);
      return;
    }
    if (keyword === KW_main) {
      this.indent();
    } else if (keyword === KW_print) {
      let EXPR = new Eval(this.tokens.slice(1), this.types.slice(1)).toStr();
      if (!EXPR) {
        throw new Error("RUNTIME ERROR: EXPRESSION IS NOT VALID");
      }
      process.stdout.write(EXPR);
    } else if (keyword === KW_if) {
      let CONDITION = new Eval(
        this.types.slice(1),
        this.tokens.slice(1)
      ).toStr();
      if (CONDITION === "TrueLove") {
        executionCodeLevel += 1;
      }
      currentCodeLevel += 1;
    } else if (keyword === KW_def) {
      inFunction = true;
    } else if (keyword === KW_endless_loop) {
      inLoop = true;
      whileCondition = true;
      this.indent();
    } else if (keyword === KW_break) {
      inLoop = false;
      whileCondition = false;
      inLoopStatements = [];
    } else if (keyword === KW_let) {
      variables[this.tokens[this.tokens.indexOf(KW_let) + 1]] = new Eval(
        this.tokens.slice(this.tokens.indexOf(KW_assign) + 1),
        this.types.slice(this.tokens.indexOf(KW_assign) + 1)
      ).toStr();
    }
  }

  runFunction(func) {
    let content = functions[func];
    for (let statements of content) {
      new Interpreter(statements[0], statements[1]);
    }
  }
}

function runInInterpreter(filePath) {
  let content = fs.readFileSync(filePath);
  content += "\n";
  content = content.split("\n");

  for (let i = 0; i < content.length; i++) {
    currentLine += 1;
    let tokens = lex(content[i]);
    let token = new Token(tokens);

    if (token.tokens) {
      try {
        new Interpreter(token.types, token.tokens);
      } catch (e) {
        process.stdout.write(
          `\nFROM FILE ${filePath}\nEXCEPTION ON LINE ${currentLine} : ${e.message}\n\n${e.stack}\n\nExiting Program...\n`
        );
        process.exit(-1);
      }
    }
  }
}

module.exports = runInInterpreter;
