import { Client } from "discordx";
import { Events } from "discord.js";
const client = new Client({
  intents: ["Guilds", "GuildMessages", "GuildMembers"],
  silent: false,
});

client.on(Events.ClientReady, async () => {
  console.log(">> Bot started");

  // Fetch all guilds
  const guilds = await client.guilds.fetch();
  console.log(">> Fetched guilds", guilds.size);

  await client.initApplicationCommands();
});

let lastPing = Date.now();

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    const now = Date.now();

    if (now - lastPing > 5000) {
      return;
    }

    message.reply(`Pong!`);
    lastPing = now;
  }
});

client.login(process.env.DBOT_TOKEN);
