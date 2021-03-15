const axios = require("axios");
const alias = require("./alias");

const res = {};

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
              alias: await alias.name(id3toid64(key)),
            };
          else {
            addToRes(key, players[key].class_stats[0]);
          }
        }
      }
    }
    wepStats();
    return res;
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

exports.build = buildRes;
