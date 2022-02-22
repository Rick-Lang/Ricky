const runInInterpreter = require("./src/Interpreter.js");
const runInPython = require("./src/PyRickroll.js");
const fs = require("fs");

const args = process.argv.slice(2);
const fileName = args[0];
const compile = args.indexOf("-c") !== -1 ? args[args.indexOf("-c") + 1] : "";
const output = args.indexOf("-o") !== -1 ? args[args.indexOf("-o") + 1] : "";
const forceInterpreter = args.indexOf("-i") !== -1;

const execOutput =
  args.indexOf("-e") !== -1 ? args[args.indexOf("-e") + 1] : "";

if (compile) {
  if (["python", "py"].includes(compile.toLowerCase())) {
    runInPython(fileName).then((fileContent) => {
      if (output) {
        fs.writeFileSync(output, fileContent);
      } else {
        console.log(fileContent);
      }
    });
  } else if (["cpp", "c++"].includes(compile.toLowerCase())) {
    throw new Error("C++ not supported yet");
  }
} else {
  if ((output || execOutput) && forceInterpreter) {
    throw new Error("Cannot use -o and -e flags with interpreter options");
  }
  if (!forceInterpreter) {
    console.log(
      "[Error] Interpreter is outdated and very buggy. Use -i flag to force use it.\nInstead, use -c [language] to compile the file."
    );
  } else if (forceInterpreter) {
    runInInterpreter(fileName);
  }
}
