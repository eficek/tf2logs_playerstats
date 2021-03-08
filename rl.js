const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

exports.question = function (query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

exports.interface = rl;