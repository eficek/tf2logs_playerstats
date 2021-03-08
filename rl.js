const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

exports.question = function (q) {
  var response;

  rl.setPrompt(q);
  rl.prompt();

  return new Promise((resolve, reject) => {
    rl.on("line", (userInput) => {
      response = userInput;
      rl.close();
    });

    rl.on("close", () => {
      resolve(response);
    });
  });
};
