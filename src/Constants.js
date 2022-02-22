const KW_print = "ijustwannatelluhowimfeeling";
const KW_if = "andifuaskmehowimfeeling";

const KW_let = "give";
const KW_assign = "up";
const KW_import1 = "weknowthe";
const KW_import2 = "andwe'regonnaplayit";
const KW_def = "gonna";
const KW_return1 = "whenigivemy";
const KW_return2 = "itwillbecompletely";
const KW_try = "thereaintnomistaking";
const KW_except = "iftheyevergetudown";
const KW_main = "takemetourheart";
const KW_end = "saygoodbye";

const KW_break = "desertu";
const KW_continue = "runaround";
const KW_endless_loop = "togetherforeverandnevertopart";
const KW_while_loop = "togetherforeverwith";

const KW_less_than_OP = "islessthan";
const KW_greater_than_OP = "isgreaterthan";
const KW_greater_or_equals_OP = "isgreaterthanorequalto";
const KW_less_or_equals_OP = "islessthanorequalto";
const KW_is_not_OP = "isnot";
const KW_equals_OP = "is";

const TT_keyword = "KEYWORDS";
const TT_operator = "OPERATORS";
const TT_number = "VALUE-NUMBER";
const TT_bool = "VALUE-BOOL";
const TT_string = "VALUE-STRING";
const TT_int = "VALUE-INT";
const TT_list = "VALUE-LIST";
const TT_float = "VALUE-FLOAT";

const TT_arguments = "ARGUMENTS";
const TT_variable = "VARIABLE";
const TT_function = "FUNCTION";
const TT_library = "LIBRARY";
const TT_build_in_funcs = "BUILD-IN-FUNCS";
const TT_identifier = "IDENTIFIER";

const keywords = [
  KW_print,
  KW_if,
  KW_let,
  KW_assign,
  KW_import1,
  KW_import2,
  KW_def,
  KW_return1,
  KW_return2,
  KW_try,
  KW_except,
  KW_main,
  KW_end,
  KW_break,
  KW_continue,
  KW_endless_loop,
  KW_while_loop,
  KW_less_than_OP,
  KW_greater_than_OP,
  KW_greater_or_equals_OP,
  KW_less_or_equals_OP,
  KW_is_not_OP,
  KW_equals_OP,
];

const ignore_tokens = ["~", "'"];

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];

const separators = [
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ",",
  "\n",
  "\r",
  " ",
  "+",
  "-",
  "*",
  "/",
  "%",
  "^^",
  "=",
  "<<",
  ">>",
  "&",
  "|",
  "^",
  ">?",
  ">>>",
];

const operators = [
  "+",
  "-",
  "*",
  "/",
  "%",
  "^",
  "=",
  "<<",
  ">>",
  "&",
  "|",
  "!",
  ">?",
  "[",
  "]",
  "(",
  ")",
  "{",
  "}",
  ",",
];

const OP_build_in_functions = ["to_string", "to_int", "to_float", "length"];

module.exports = {
  KW_print,
  KW_if,
  KW_let,
  KW_assign,
  KW_import1,
  KW_import2,
  KW_def,
  KW_return1,
  KW_return2,
  KW_try,
  KW_except,
  KW_main,
  KW_end,
  KW_break,
  KW_continue,
  KW_endless_loop,
  KW_while_loop,
  KW_less_than_OP,
  KW_greater_than_OP,
  KW_greater_or_equals_OP,
  KW_less_or_equals_OP,
  KW_is_not_OP,
  KW_equals_OP,
  TT_keyword,
  TT_operator,
  TT_number,
  TT_bool,
  TT_string,
  TT_int,
  TT_list,
  TT_float,
  TT_arguments,
  TT_variable,
  TT_function,
  TT_library,
  TT_build_in_funcs,
  TT_identifier,
  keywords,
  ignore_tokens,
  digits,
  separators,
  operators,
  OP_build_in_functions,
};
