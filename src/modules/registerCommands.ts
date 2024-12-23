import { REST, Routes } from "discord.js";
import CommandsList from "../commands";

export async function registerCommands() {
  const commands = CommandsList.map((command) => command.data.toJSON());
  console.log("Registering commands", commands);
  const rest = new REST({ version: "10" }).setToken(process.env.DBOT_TOKEN);

  try {
    const response: any = await rest.put(
      Routes.applicationCommands(process.env.DBOT_APP_ID),
      {
        body: commands,
      }
    );

    if (response.length) {
      console.log(`Registered ${response.length} commands.`);
    }
  } catch (error: any) {
    console.log("Error when registering commands:", error);
  }
}

export async function registerGuildCommands(guildId: string) {
  const commands = CommandsList.map((command) => command.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(process.env.DBOT_TOKEN);

  try {
    const response: any = await rest.put(
      Routes.applicationGuildCommands(process.env.DBOT_APP_ID, guildId),
      {
        body: commands,
      }
    );

    if (response.length) {
      console.log(
        `Registered ${response.length} commands for guild ${guildId}.`
      );
    }
  } catch (error: any) {
    console.log("Error when registering commands:", error);
  }
}
