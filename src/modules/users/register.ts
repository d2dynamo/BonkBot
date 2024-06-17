import { Guild } from "discord.js";

import parseUserId from "./userId";
import createUser from "./create";
import getUserWallet from "../debtWallet/get";
import createWallet from "../debtWallet/create";
import setUserPermission from "../../commands/permissions/setUserPermission";
import { changeUserPermissions } from "./update";

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
        await createUser(parseUserId(members[j].id), members[j].user.username);

        await changeUserPermissions(parseUserId(members[j].id), {
          permissionId: 1,
          active: true,
        });

        try {
          await getUserWallet(parseUserId(members[j].id));
        } catch (error: any) {
          if (error.message === "Wallet not found") {
            await createWallet(parseUserId(members[j].id));
          } else {
            throw error;
          }
        }
      } catch (error: any) {
        throw error;
      }
    }
  } catch (error) {
    console.error(">> Error registering users", error);
  }
}
