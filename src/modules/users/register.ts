import { Guild } from "discord.js";

import parseDiscordUID from "./userId";
import createUser from "./create";
import { getUserWallet } from "../debtWallet/get";
import { createWallet } from "../debtWallet/create";
import { changeUserPermissions } from "./update";
import { PermissionsEnum } from "../permissions/permissions";
import { stringToObjectId } from "../database/mongo";

/**
 * Register users from a guild.
 */
export default async function registerUsersFromGuild(guild: Guild) {
  try {
    const m = await guild.members.fetch();
    const members = Array.from(m.values());

    for (let j = 0; j < members.length; j++) {
      if (members[j].user.bot) {
        continue;
      }

      try {
        await getUserWallet(parseDiscordUID(members[j].id), guild.id);
      } catch (error: any) {
        if ((error.message as string).includes("Wallet not found")) {
          await createWallet(parseDiscordUID(members[j].id), guild.id);
          continue;
        } else if ((error.message as string).includes("User not found")) {
          await createUser(
            parseDiscordUID(members[j].id),
            guild.id,
            members[j].user.username
          );

          const basicPermOId = await stringToObjectId(PermissionsEnum.basic);

          if (!basicPermOId) {
            throw Error(">> Error getting basic permission object id");
          }

          await changeUserPermissions(
            parseDiscordUID(members[j].id),
            guild.id,
            {
              permissionId: basicPermOId,
              active: true,
            }
          );

          await createWallet(parseDiscordUID(members[j].id), guild.id);
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(">> Error registering users", error);
  }
}
