import { Client, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";

import EventHandler from "./handlers";
import registerCommands from "./modules/registerCommands";
import Commands from "./commands";
import registerUsers from "./modules/users/register";

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
      console.log(">> Fetched guilds", guilds.size);
      guilds.forEach(async (guild) => {
        console.log(">> Guild", guild.name);
        const g = await guild.fetch();
        await registerUsers(g);
      });

      console.log(">> Ready to bonk!");
    });

    client.on(Events.MessageCreate, async (message) =>
      EventHandler.messageCreate(message)
    );

    client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        EventHandler.slashCommand(interaction);
        return;
      }
      console.log(">> Interaction", interaction);
    });

    client.login(process.env.DBOT_TOKEN);
  } catch (error) {
    console.error(">> Main Func catch:", error);
  }
})();
