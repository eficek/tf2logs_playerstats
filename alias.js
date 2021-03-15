const axios = require("axios");

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

exports.name = name;