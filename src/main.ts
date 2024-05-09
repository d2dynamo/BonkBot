import { Client, Events, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
import "dotenv/config";

import EventHandler from "./handlers";
import registerCommands from "./modules/registerCommands";
import Commands from "./commands";

(async () => {
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
})();
