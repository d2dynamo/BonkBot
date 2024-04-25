import GamerWord from "../interfaces/GamerWord";

const RWord = new GamerWord(["rape", "raped", "våldtäckt"]);
const RWordCheat = new GamerWord(
  ["r4pe", "rap3", "r4p3", "r4ped", "rap3d", "r4p3d", "räped"],
  { response: "nice try you naughty naughty", cost: 10 }
);

export default [RWord, RWordCheat];
