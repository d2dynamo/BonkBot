import { VarChar } from "mssql";

import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import { UserError } from "../errors";
import GamerWord from "./gamerWord";

// TODO: CACHING FOR THIS SH**. This will be called on every f***ing message in discord.

/**
 * Get all GameWords.
 * @returns GamerWord arra
 */
export default async function listAndBuildGamerWords(): Promise<GamerWord[]> {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  const query = `--sql
    SELECT
      id,
      phrases,
      response,
      cost,
      created_at
      updated_at
    FROM
      gamer_words
  `;

  const result = await sql.query(query);

  if (result.recordset.length === 0) {
    throw new Error("No gamer words found");
  }

  const gamerWordList: GamerWord[] = [];

  for (let i = 0; i < result.recordset.length; i++) {
    if (typeof result.recordset[i].phrases !== "string") {
      console.log(
        `Phrases for a gamer word is not a string. id: ${result.recordset[i].id}`
      );
      continue;
    }
    const phrasesRaw = result.recordset[i].phrases as string;

    const phrasesArr = phrasesRaw.split(",").map((phrase) => phrase.trim());

    gamerWordList.push(
      new GamerWord(phrasesArr, {
        response: result.recordset[i].response,
        cost: result.recordset[i].cost,
      })
    );
  }

  return gamerWordList;
}
