import LoadDebt from "./debt/loadDebt";
import AddDebt from "./debt/addDebt";
import SetDebt from "./debt/setDebt";
import RemoveDebt from "./debt/removeDebt";
import ListGamerWords from "./gamerWord/listGamerWords";
import SetUserPermission from "./permissions/setUserPermission";

export {
  LoadDebt,
  AddDebt,
  SetDebt,
  RemoveDebt,
  ListGamerWords,
  SetUserPermission,
};

/**
 * Commands list.
 */
export default [
  LoadDebt,
  AddDebt,
  SetDebt,
  RemoveDebt,
  ListGamerWords,
  SetUserPermission,
];
