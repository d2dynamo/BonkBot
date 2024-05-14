import { Guild } from "discord.js";
import getUser from "./get";
import parseUserId from "./userId";
import createUser from "./create";
import getUserWallet from "../debtWallet/get";
import createWallet from "../debtWallet/create";

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
      console.log(">> Registering user", members[j].user);

      try {
        await getUser(parseUserId(members[j].id));

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
        console.log(">> Error", error.message);
        if (error.message === "User not found") {
          console.log(">> User not found, creating user");

          await createUser(parseUserId(members[j].id));

          try {
            await getUserWallet(parseUserId(members[j].id));
          } catch (error: any) {
            if (error.message === "Wallet not found") {
              await createWallet(parseUserId(members[j].id));
            } else {
              throw error;
            }
          }
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(">> Error registering users", error);
  }
}
