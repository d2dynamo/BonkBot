import { UniqueIdentifier } from "mssql";

import {
  MSSQLDatabaseType as dbList,
  getMSSQLRequest,
} from "../../database/mssql";
import GamerWord from "./gamerWord";

// TODO: CACHING FOR THIS SH**. This will be called on every f***ing message in discord.

/**
 * Get all GameWords.
 * @returns GamerWord array
 */
export default async function listAndBuildGamerWords(): Promise<GamerWord[]> {
  const sql = await getMSSQLRequest(dbList.bonkDb);

  const query = `--sql
    SELECT
      gw.id,
      gw.word,
      gw.cost,
      gw.response,
      gw.created_at,
      gw.updated_at,
      (SELECT
          gwp.phrase
      FROM
          gamer_word_phrases gwp
      WHERE
          gwp.gamer_word_id = gw.id
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS phrases
    FROM
      gamer_words gw
  `;

  const result = await sql.query(query);

  if (result.recordset.length === 0) {
    throw new Error("No gamer words found");
  }

  const gamerWordList: GamerWord[] = [];

  for (let i = 0; i < result.recordset.length; i++) {
    const gamerWord = new GamerWord(
      result.recordset[i].word,
      result.recordset[i].cost,
      { response: result.recordset[i].response || null }
    );

    gamerWordList.push(gamerWord);
  }

  return gamerWordList;
}
