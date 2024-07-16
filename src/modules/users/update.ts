import { DiscordUID } from "../../interfaces/database";
import getUser from "./get";
import { ObjectId } from "mongodb";
import connectCollection from "../database/mongo";

interface permissionStatus {
  permissionId: ObjectId;
  active: boolean;
}

export async function changeUserPermissions(
  userId: DiscordUID,
  permission: permissionStatus | permissionStatus[]
) {
  await getUser(userId);

  let inp = Array.isArray(permission) ? permission : [permission];

  const coll = await connectCollection("userPermissions");

  const bulkOps = inp.map((perm) => ({
    updateOne: {
      filter: {
        userId: userId,
        permissionId: perm.permissionId,
      },
      update: {
        $set: {
          active: perm.active,
          updatedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  const result = await coll.bulkWrite(bulkOps);

  if (!result.upsertedCount && !result.modifiedCount) {
    throw Error(`failed to update permissions for user: ${userId}`);
  }

  return true;
}
