import { REST, Routes } from "discord.js";
import CommandsList from "../commands";

export default async function () {
  const commands = CommandsList.map((command) => command.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DBOT_TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");
    const result = await rest.put(
      Routes.applicationCommands(process.env.DBOT_APP_ID),
      {
        body: commands,
      }
    );

    console.log("result", result);
  } catch (error: any) {
    console.log(error);
  }
}
