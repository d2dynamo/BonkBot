import { Client } from "discordx";
import { Events } from "discord.js";
import "dotenv/config";

import EventHandler from "./handlers";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "GuildMembers", "MessageContent"],
  silent: false,
});

client.on(Events.ClientReady, async () => {
  console.log(">> Bot started");

  // Fetch all guilds
  const guilds = await client.guilds.fetch();
  console.log(">> Fetched guilds", guilds.size);

  await client.initApplicationCommands();
});

client.on(Events.MessageCreate, async (message) =>
  EventHandler.messageCreate(message)
);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(">> Interaction", interaction);

  EventHandler.slashCommand(interaction);
});

client.login(process.env.DBOT_TOKEN);
