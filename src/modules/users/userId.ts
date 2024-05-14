import { UserId } from "../../interfaces/database";

/**
 * Checks if the given input is a valid userId.
 * @param userId discord uid
 */
export default function parseUserId(userId: number | string): UserId {
  let id: UserId;

  if (typeof userId === "number") {
    id = userId.toString();
  } else if (typeof userId === "string") {
    id = userId;
  } else {
    throw new Error("Invalid userId type");
  }

  if (isNaN(parseInt(id))) {
    throw new Error("Invalid userId type");
  }

  return id;
}
