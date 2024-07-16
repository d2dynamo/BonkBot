import { GamerWord as GameWordDoc } from "../../interfaces/database";
import GamerWord from "./gamerWord";
import connectCollection from "../database/mongo";

// TODO: Cache the gamerwords in memory maybe? This will be called on every message in discord otherwise.
interface GWord {
  word: string;
  createdAt: number;
  updatedAt: number;
  phrases: string[];
}

export async function listGamerWords(): Promise<GameWordDoc[]> {
  const coll = await connectCollection("gamerWords");

  const result = coll.find({});

  return await result.toArray();
}

export default async function listAndBuildGamerWords(): Promise<GamerWord[]> {
  const result = (await listGamerWords()).map((item) => {
    let optionals =
      item.response || item.createdAt || item.updatedAt
        ? {
            response: item.response,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }
        : undefined;

    const gamerWord = new GamerWord(item.phrases, item.cost, optionals);

    return gamerWord;
  });

  return result;
}
