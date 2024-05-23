import drizzledb, { DatabaseType } from "../database/drizzle";
import { gamerWordPhrases } from "../database/schema";

/**
 * Add phrases to a gamer word.
 * @param gamerWordId The id of the gamer word.
 * @param phrases The phrases to add.
 */
export default async function addPhrasesToGamerWord(
  gamerWordId: number,
  phrases: string[]
) {
  const db = drizzledb(DatabaseType.bonkDb);

  const values = phrases.map((phrase) => {
    return {
      gamerWordId: gamerWordId,
      phrase: phrase,
    };
  });

  const result = await db
    .insert(gamerWordPhrases)
    .values(values)
    .onConflictDoNothing();

  if (!result.changes) {
    throw new Error("Failed to add phrases to gamer word");
  }

  return true;
}
