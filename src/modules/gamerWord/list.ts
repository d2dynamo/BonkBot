import { sql, eq } from "drizzle-orm";

import drizzledb, { DatabaseType } from "../database/drizzle";
import { gamerWords, gamerWordPhrases } from "../database/schema";
import GamerWord from "./gamerWord";

// TODO: Cache the gamerwords in memory maybe? This will be called on every message in discord otherwise.
interface GWord {
  word: string;
  createdAt: number;
  updatedAt: number;
  phrases: string[];
}

/**
 * Get all gamer words (non class)
 */
export async function listGamerWords(): Promise<GWord[]> {
  const db = drizzledb(DatabaseType.bonkDb);

  const gamerWordsArray = await db.transaction(async (tx) => {
    const gamerWordsResult = await tx
      .select({
        word: gamerWords.word,
        createdAt: gamerWords.createdAt,
        updatedAt: gamerWords.updatedAt,
        phrases: sql`json_group_array(${gamerWordPhrases.phrase}) as phrases`,
      })
      .from(gamerWords)
      .innerJoin(
        gamerWordPhrases,
        eq(gamerWordPhrases.gamerWordId, gamerWords.id)
      );

    if (gamerWordsResult.length === 0) {
      throw new Error("No gamer words found");
    }

    const gWordList = gamerWordsResult.map((gWord) => {
      return {
        word: gWord.word,
        createdAt: gWord.createdAt,
        updatedAt: gWord.updatedAt,
        phrases: JSON.parse(gWord.phrases as string) as string[],
      };
    });

    return gWordList;
  });

  return gamerWordsArray;
}

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
        phrases: sql`json_group_array(${gamerWordPhrases.phrase}) as phrases`,
      })
      .from(gamerWords)
      .innerJoin(
        gamerWordPhrases,
        eq(gamerWordPhrases.gamerWordId, gamerWords.id)
      );

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
