import { CommandInteraction } from "discord.js";

import Commands from "../commands";

export default async (interaction: CommandInteraction) => {
  console.log(">> Slash command", interaction);
  const commandName = interaction.commandName;

  const command = Commands.find((command) => command.data.name === commandName);

  if (!command) {
    console.log(">> Command not found", commandName);
    await interaction.reply("Command not found");
    return;
  }

  console.log(">> Executing command", commandName);
  command.execute(interaction);
};
