import { CommandInteraction } from "discord.js";

import Commands from "../commands";

export default async (interaction: CommandInteraction) => {
  const commandName = interaction.commandName;

  const command = Commands.find((command) => command.data.name === commandName);

  if (!command) {
    console.log(">> Command not found", commandName);
    await interaction.reply("Command not found");
    return;
  }

  command.execute(interaction);
};
