import LoadDebt from "./debt/loadDebt";
import AddDebt from "./debt/addDebt";
import SetDebt from "./debt/setDebt";
import RemoveDebt from "./debt/removeDebt";
import ListGamerWords from "./gamerWord/listGamerWords";
import AddPhrase from "./gamerWord/addPhrase";

export { LoadDebt, AddDebt, SetDebt, RemoveDebt, ListGamerWords, AddPhrase };

/**
 * Commands list.
 */
export default [
  LoadDebt,
  AddDebt,
  SetDebt,
  RemoveDebt,
  ListGamerWords,
  AddPhrase,
];
