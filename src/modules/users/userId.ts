import { DiscordUID } from "../../interfaces/database";

/**
 * Parses and validates a Discord UID.
 * @param id - The ID to validate.
 * @returns The valid Discord UID as a string.
 * @throws Error if the ID is invalid.
 */
export default function parseDiscordUID(id: any): DiscordUID {
  if (typeof id !== "string") {
    throw new Error("Invalid Discord UID: must be a string");
  }
  if (!/^\d+$/.test(id)) {
    throw new Error("Invalid Discord UID: must contain only digits");
  }
  return id;
}
