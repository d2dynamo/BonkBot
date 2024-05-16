import { sql } from "drizzle-orm";

import drizzledb, { DatabaseType } from "../database/drizzle";
import { gamerWords, gamerWordPhrases } from "../database/schema";
import GamerWord from "./gamerWord";

// TODO: Cache the gamerwords in memory maybe? This will be called on every message in discord otherwise.

/**
 * Get all GameWords.
 * @returns GamerWord array
 */
export default async function listAndBuildGamerWords(): Promise<GamerWord[]> {
  const db = drizzledb(DatabaseType.bonkDb);

  const gamerWordsArray = await db.transaction(async (tx) => {
    const gamerWordsResult = await tx
      .select({
        id: gamerWords.id,
        word: gamerWords.word,
        cost: gamerWords.cost,
        response: gamerWords.response,
        createdAt: gamerWords.createdAt,
        updatedAt: gamerWords.updatedAt,
        phrases: sql`(
        SELECT json_group_array(gwp.phrase)
        FROM ${gamerWordPhrases} gwp
        WHERE gwp.gamerWordId = ${gamerWords.id}
      )`.as("phrases"),
      })
      .from(gamerWords);

    if (gamerWordsResult.length === 0) {
      throw new Error("No gamer words found");
    }

    const gamerWordList: GamerWord[] = [];

    for (let i = 0; i < gamerWordsResult.length; i++) {
      const phrases = JSON.parse(
        gamerWordsResult[i].phrases as string
      ) as string[];

      const gamerWord = new GamerWord(phrases, gamerWordsResult[i].cost, {
        response: gamerWordsResult[i].response || undefined,
      });

      gamerWordList.push(gamerWord);
    }

    return gamerWordList;
  });

  return gamerWordsArray;
}
