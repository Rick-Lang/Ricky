const lex = require("./Lexer");
const {
  keywords,
  KW_assign,
  KW_break,
  KW_continue,
  KW_def,
  KW_end,
  KW_endless_loop,
  KW_except,
  KW_if,
  KW_import1,
  KW_let,
  KW_main,
  KW_print,
  KW_return1,
  KW_try,
  KW_while_loop,
  OP_build_in_functions,
  operators,
  TT_arguments,
  TT_bool,
  TT_build_in_funcs,
  TT_function,
  TT_keyword,
  TT_list,
  TT_number,
  TT_operator,
  TT_string,
  TT_variable,
} = require("./Constants.js");
const fs = require("fs");

const keywordExeOutsideMain = [KW_main, KW_def, KW_import1];

let variables = [];
let functions = [];

let indentCount = 0;
let currentLine = 0;

let isMain = false;
let isFunction = false;

let pyCode = "";

let libraries = [];

function varTypes(string) {
  let str = string.toString();
  if (["True", "False"].includes(str)) {
    return "bool";
  } else if (str[0] === '"' && str[str.length - 1] === '"') {
    return "string";
  } else if (str[0] === "[" && str[str.length - 1] === "]") {
    return "list";
  }
  if (!isNaN(Number(str))) {
    return "number";
  }
}

class Token {
  constructor(tokens) {
    this.tokenTypes = [];
    this.tokenValues = [];
    this.lastKeyword = "";

    for (let token of tokens) {
      if (token) {
        this.makeToken(token);
      }
    }
  }

  addedToTokens(types, token) {
    this.tokenTypes.push(types);
    this.tokenValues.push(token);
  }

  makeToken(token) {
    if (keywords.includes(token)) {
      if (token === "is") {
        this.addedToTokens(TT_operator, "==");
      } else if (token === "isnot") {
        this.addedToTokens(TT_operator, "!=");
      } else if (token === "isgreaterthan") {
        this.addedToTokens(TT_operator, ">");
      } else if (token === "islessthan") {
        this.addedToTokens(TT_operator, "<");
      } else if (token === "isgreaterthanorequalto") {
        this.addedToTokens(TT_operator, ">=");
      } else if (token === "islessthanorequalto") {
        this.addedToTokens(TT_operator, "<=");
      } else {
        this.addedToTokens(TT_keyword, token);
      }

      this.lastKeyword = token;
    } else if (OP_build_in_functions.includes(token)) {
      if (token === "length") {
        this.addedToTokens(TT_build_in_funcs, "len");
      } else if (token === "to_string") {
        this.addedToTokens(TT_build_in_funcs, "str");
      } else if (token === "to_int") {
        this.addedToTokens(TT_build_in_funcs, "int");
      } else if (token === "to_float") {
        this.addedToTokens(TT_build_in_funcs, "float");
      }
    } else if (varTypes(token) === "bool") {
      this.addedToTokens(TT_bool, token);
    } else if (varTypes(token) === "string") {
      this.addedToTokens(TT_string, token);
    } else if (varTypes(token) === "number") {
      this.addedToTokens(TT_number, token);
    } else if (varTypes(token) === "list") {
      this.addedToTokens(TT_list, token);
    } else if (operators.includes(token)) {
      this.addedToTokens(TT_operator, token);
    } else if (this.lastKeyword === KW_let) {
      variables.push(token);
      this.addedToTokens(TT_variable, token);
    } else if (this.lastKeyword === KW_def) {
      functions.push(token);
      this.addedToTokens(TT_function, token);
    } else if (token && variables.includes(token)) {
      this.addedToTokens(TT_variable, token);
    } else {
      this.addedToTokens(TT_arguments, token);
    }
  }
}

class TranslateToPython {
  constructor() {
    this.types = [];
    this.values = [];
  }

  translate(types, values) {
    this.types = types;
    this.values = values;

    if (this.types.length !== 0) {
      if (
        this.types[0] === TT_keyword ||
        functions.includes(this.values[0] || libraries.includes(this.values[0]))
      ) {
        if (
          isMain ||
          (isMain === false &&
            keywordExeOutsideMain.includes(this.values[0])) ||
          isFunction
        ) {
          this.convertKeyword(this.values[0]);
        } else {
          process.stdout.write(
            `ERROR: KEYWORD ${this.values[0]} CANNOT BE EXECUTED OUTSIDE OF MAIN FUNCTION\n`
          );
        }
      } else {
        process.stdout.write(
          `ERROR: ${this.values[0]} IS NOT A VALID KEYWORD NOR FUNCTION\n`
        );
      }
    } else {
      this.write("");
    }
  }

  convertKeyword(keyword) {
    if (functions.includes(keyword)) {
      this.write(this.values.join(""));
    } else if (keyword === KW_main) {
      this.write("if __name__ == '__main__':");

      isMain = true;
      indentCount += 1;
    } else if (indentCount === 0) {
      if (isMain) {
        isMain = false;
      }
      if (isFunction) {
        isFunction = false;
      }
    } else if (keyword === KW_print) {
      let EXPR = this.values.slice(1, this.values.length).join("");
      this.write(`print(${EXPR}, end="")`);
    } else if (keyword === KW_let) {
      let ID = this.values
        .slice(this.values.indexOf(KW_let) + 1, this.values.indexOf(KW_assign))
        .join("");
      let EXPR = this.values
        .slice(this.values.indexOf(KW_assign) + 1, this.values.length)
        .join("");
      this.write(`${ID} = ${EXPR}`);
    } else if (keyword === KW_if) {
      let CONDITION = this.values.slice(1, this.values.length).join("");
      this.write(`if ${CONDITION}:`);
      indentCount += 1;
    } else if (keyword === KW_try) {
      this.write("try:");
      indentCount += 1;
    } else if (keyword === KW_except) {
      this.write("except:");
      indentCount += 1;
    } else if (keyword === KW_endless_loop) {
      this.write("while True:");
      indentCount += 1;
    } else if (keyword === KW_while_loop) {
      let CONDITION = this.values.slice(1, this.values.length).join("");
      this.write(`while ${CONDITION}:`);
      indentCount += 1;
    } else if (keyword === KW_break) {
      this.write("break");
    } else if (keyword === KW_continue) {
      this.write("continue");
    } else if (keyword === KW_def) {
      let ID = this.values[1];
      let ARGS = this.values.slice(2, this.values.length).join("");

      this.write(`def ${ID}(${ARGS}):`);

      isFunction = true;
      indentCount += 1;
    } else if (keyword === KW_return1) {
      let EXPR = this.values.slice(1, this.values.length).join("");
      this.write(`return ${EXPR}`);
    } else if (keyword === KW_end) {
      this.write("pass");
      indentCount -= 1;
    }
  }

  write(statement) {
    pyCode += `${" ".repeat(indentCount * 4)}${statement}\n`;
  }
}

async function runInPy(fileName) {
  const transpiler = new TranslateToPython();
  let content = fs.readFileSync(fileName).toString();
  content += "\n";
  content = content.match(/(^.*)(?:\r\n|\n)/gm);
  for (let i = 0; i < content.length; i++) {
    currentLine += 1;
    let token = new Token(lex(content[i]));
    transpiler.translate(token.tokenTypes, token.tokenValues);
  }

  return pyCode;
}

module.exports = runInPy;
