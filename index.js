const rl = require("./rl");
const result = require("./result")

const indexes = (source, find) => {
  // find instances of find argument in a string, return array of indexes
  if (!source) {
    return [];
  }
  if (!find) {
    return source.split("").map((_, i) => i);
  }
  var result = [];
  for (i = 0; i < source.length; ++i) {
    if (source.substring(i, i + find.length) == find) {
      result.push(i);
    }
  }
  return result;
};

const buildString = (player) => {
  // return formatted stats string for each player
  let str = `${player.alias}:\ntotal kills: ${player.stats.kills}; total dmg: ${player.stats.dmg}\n`;
  for (const key in player.stats.weapon) {
    const wep = player.stats.weapon[key];
    if (typeof wep == "object" && (wep.kills > 0 || wep.dmg > 0)) {
      str += `${key}:\n    kills: ${wep.kills} - ${wep.killPercent}% of total\n    dmg: ${wep.dmg} - ${wep.dmgPercent}% of total\n`;
    } else if (typeof wep === "number" && wep > 0)
      str += `${key}:\n    kills: ${wep} - ${(
        (wep / player.stats.kills) *
        100
      ).toFixed(2)}% of total\n`;
  }
  return str;
};

const main = async () => {
  try {
    let logIDs = [];
    const logInput = await rl.question(
      "enter links of all logs you would like to process: "
    );
    const idxs = indexes(logInput, "logs.tf/");
    for (let i = 0; i < idxs.length; i++) {
      logIDs.push(parseInt(logInput.slice(idxs[i] + 8, idxs[i] + 15)));
    }
    let classInput = await rl.question("enter class to target: ");
    const classes = [
      "scout",
      "soldier",
      "pyro",
      "demoman",
      "heavyweapons",
      "engineer",
      "medic",
      "sniper",
      "spy",
    ];
    if (classInput === "heavy") classInput = "heavyweapons";
    if (classInput === "demo") classInput = "demoman";
    if (!classes.includes(classInput)) {
      console.log("invalid class");
      rl.interface.close();
      return; // TODO: repeat question instead of terminating
    }
    rl.interface.close();
    const res = await result.build(logIDs, classInput);
    for (const player in res) {
      console.log(buildString(res[player]));
    }
    return;
  } catch (err) {
    console.error(err);
  }
};

main();
