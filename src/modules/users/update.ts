import { getUser } from "./get";
import connectCollection from "../database/mongo";
import { UserPerm } from "../../interfaces/database";

export async function changeUserPermissions(
  discordUID: string,
  guildDID: string,
  permission: UserPerm | UserPerm[]
) {
  const user = await getUser(discordUID, guildDID);

  let inp = Array.isArray(permission) ? permission : [permission];

  const coll = await connectCollection("userPermissions");

  const result = await coll.updateOne(
    {
      userId: user._id,
    },
    {
      $addToSet: {
        permissions: { $each: inp },
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (!result.upsertedCount && !result.modifiedCount) {
    throw Error(`failed to update permissions for user: ${user._id}`);
  }

  return true;
}
