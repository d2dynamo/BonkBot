import { ObjectId } from "mongodb";
import connectCollection, { stringToObjectId } from "../database/mongo";

export default async function addPhrasesToGamerWord(
  gamerWordId: ObjectId | string,
  phrases: string[]
) {
  const gwObjectId = await stringToObjectId(gamerWordId);

  if (!gwObjectId) {
    throw new Error("Invalid gamerWordId");
  }

  const coll = await connectCollection("gamerWords");

  const result = await coll.updateOne(
    { _id: gwObjectId },
    { $push: { phrases: { $each: phrases } } }
  );

  if (!result.acknowledged) {
    throw new Error("Failed to add phrases to gamer word");
  }

  return true;
}
