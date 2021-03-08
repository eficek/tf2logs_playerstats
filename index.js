const axios = require("axios");
const rl = require("./rl");

const res = {};

const name = async (id64) => {
  // scrape player's alias from rgl
  try {
    console.log("getting rgl alias...");
    const profile = await axios.get(
      `https://rgl.gg/public/PlayerProfile.aspx?p=${id64}`
    );
    const dataString = profile.data.slice(0, 2500); // why store ~50k characters when we'll only ever check the first few? :)
    const start = dataString.indexOf("<title>");
    const end = dataString.indexOf(" - RGL.gg Player Profile");
    const name = dataString.slice(start + 13, end);
    console.log("alias:", name);
    if (name.length < 64) return name;
    else return `[${id64}]`;
  } catch (err) {
    console.error(err);
  }
};

const indexes = (source, find) => {
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

const getLogIDs = async () => {};

const id3toid64 = (id3) => {
  // FORMULA: 76561197960265728 + x where x is U:1:x ... see https://forum.tsgk.com/viewtopic.php?t=26238
  const idBigInt = BigInt(id3.split(":")[2].slice(0, -1));
  const id64 = 76561197960265728n + idBigInt;
  return id64.toString();
};

const addToRes = (resKey, newStats) => {
  // there's almost definitely a less horrific way to do this but i'm lazy atm, will likely fix later
  for (const key in newStats) {
    if (typeof res[resKey].stats[key] == "number")
      res[resKey].stats[key] += newStats[key];
    if (typeof res[resKey].stats[key] == "object")
      for (const wepKey in newStats[key]) {
        for (const wepStatKey in newStats[key][wepKey]) {
          if (res[resKey].stats[key][wepKey] == null)
            res[resKey].stats[key][wepKey] = newStats[key][wepKey][wepStatKey];
          else
            res[resKey].stats[key][wepKey][wepStatKey] +=
              newStats[key][wepKey][wepStatKey];
        }
      }
  }
};

const buildRes = async (logIDs, targetClass) => {
  // builds the initial res object from the list of logs
  try {
    for (let i = 0; i < logIDs.length; i++) {
      console.log("processing log " + logIDs[i] + "...");
      const response = await axios.get(`http://logs.tf/json/${logIDs[i]}`);
      const players = response.data.players;
      for (const key in players) {
        if (players[key].class_stats[0].type == targetClass) {
          if (res[key] == null)
            res[key] = {
              stats: players[key].class_stats[0],
              alias: await name(id3toid64(key)),
            };
          else {
            addToRes(key, players[key].class_stats[0]);
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const wepStats = () => {
  // add dmgPercent and killPercent properties to each weapon
  for (const key in res) {
    const player = res[key];
    const totalDmg = player.stats.dmg;
    const totalKills = player.stats.kills;
    for (const key in player.stats.weapon) {
      const wep = player.stats.weapon[key];
      if (typeof wep == "object") {
        player.stats.weapon[key].dmgPercent = (
          (wep.dmg / totalDmg) *
          100
        ).toFixed(2);
        player.stats.weapon[key].killPercent = (
          (wep.kills / totalKills) *
          100
        ).toFixed(2);
      }
    }
  }
};

const buildString = (player) => {
  // return formatted stats string for each player
  let res = `${player.alias}:\ntotal kills: ${player.stats.kills}; total dmg: ${player.stats.dmg}\n`;
  for (const key in player.stats.weapon) {
    const wep = player.stats.weapon[key];
    if (typeof wep == "object") {
      res += `${key}:\n    kills: ${wep.kills} - ${wep.killPercent}% of total\n    dmg: ${wep.dmg} - ${wep.dmgPercent}% of total\n`;
    } else
      res += `${key}:\n    kills: ${wep} - ${(wep / player.stats.kills).toFixed(
        2
      )}% of total\n`;
  }

  return res;
};

const questionClass = () => {
  return new Promise((resolve, reject) => {
    rl.question("enter class to target: ", (input) => resolve(input));
  });
};

const main = async () => {
  try {
    // is shoving the whole main function inside a question callback a bad practice? i certainly hope not
    let logIDs = [];
    const logInput = await rl.question(
      "enter links of all logs you would like to process: "
    );
    const idxs = indexes(logInput, "logs.tf/");
    for (let i = 0; i < idxs.length; i++) {
      logIDs.push(parseInt(logInput.slice(idxs[i] + 8, idxs[i] + 15)));
    }
    const classInput = await rl.question("enter class to target: ");
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
      rl.interface.close()
      return; // TODO: repeat question instead of terminating
    }
    rl.interface.close()
    await buildRes(logIDs, classInput);
    wepStats();
    for (const player in res) {
      console.log(buildString(res[player]));
    }
    return;
  } catch (err) {
    console.error(err);
  }
};

main();
