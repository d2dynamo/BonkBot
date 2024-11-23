import { Client, Events, GatewayIntentBits, Guild } from "discord.js";
import "dotenv/config";

import EventHandler from "./handlers";
import registerCommands from "./modules/registerCommands";
import Commands from "./commands";
import registerUsers from "./modules/users/register";
import connectCollection, {
  stringToObjectIdSyncForce,
} from "./modules/database/mongo";
import registerGuild from "./modules/guild/register";
import { getGuild } from "./modules/guild/get";
import { listGuildGamerWordsWOID } from "./modules/gamerWord/list";
import { PermissionsEnum } from "./modules/permissions/permissions";
import { changeUserPermissions } from "./modules/users/update";

(async () => {
  if (process.env.NODE_ENV == "development") {
    try {
      // const result = await changeUserPermissions("69420", [
      //   {
      //     permissionId: stringToObjectIdSyncForce(PermissionsEnum.basic),
      //     active: true,
      //   },
      //   {
      //     permissionId: stringToObjectIdSyncForce(PermissionsEnum.banker),
      //     active: true,
      //   },
      // ]);
      // console.log("result", result);
    } catch (err) {
      console.log(err);
    }
  }

  try {
    const mongo = await connectCollection("permissions");

    const tryFind = await mongo.findOne({ name: "basic" });

    if (!tryFind) {
      throw Error(
        "No basic permission found. Database might be not connected."
      );
    }

    const client = new Client({
      intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    if (!process.env.DBOT_TOKEN) {
      console.error(">> No token provided");
      return;
    }

    client.on(Events.ClientReady, async () => {
      console.log(">> Bot started");

      console.log(">> Registering commands");

      client.application?.commands.set(
        Commands.map((command) => command.data.toJSON())
      );

      await registerCommands();

      const guilds = await client.guilds.fetch();

      console.log(">> Fetching guilds", guilds.size);

      guilds.forEach(async (guild) => {
        console.log(">> Guild", guild.name, guild.id);

        const g = await guild.fetch();

        //ensure owner is admin
        const owner = g.ownerId;

        await changeUserPermissions(owner, guild.id, {
          permissionId: stringToObjectIdSyncForce(PermissionsEnum.admin),
          active: true,
        });

        await registerGuild(g);
        await registerUsers(g);

        const bonkGuild = await getGuild(g.id);

        await listGuildGamerWordsWOID(bonkGuild.id);
      });

      console.log(">> Ready to bonk!");
    });

    client.on(Events.MessageCreate, async (message) =>
      EventHandler.messageCreate(message)
    );

    client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isAutocomplete()) {
        EventHandler.autoComplete(interaction);
        return;
      }

      if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        EventHandler.slashCommand(interaction);
        return;
      }

      console.log(">> Interaction weird", interaction);
    });

    client.login(process.env.DBOT_TOKEN);
  } catch (error) {
    console.error(">> Main Func catch:", error);
  }
})();
