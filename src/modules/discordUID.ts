import { DiscordUID } from "../interfaces/database";

/**
 * Parses and validates a Discord UID.
 * @param id - The ID to validate.
 * @returns The valid Discord UID as a string.
 * @throws Error if the ID is invalid.
 */
export default function parseDiscordUID(id: any): DiscordUID {
  let pId = id;
  if (typeof pId == "number") {
    pId = pId.toString();
  }
  if (typeof pId !== "string" || !/^\d+$/.test(pId)) {
    throw new Error(
      "Invalid Discord UID: must be a string that only contains digits"
    );
  }
  return pId as DiscordUID;
}
