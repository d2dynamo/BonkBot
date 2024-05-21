import { CommandInteraction } from "discord.js";

import Commands from "../commands";
import { UserError } from "../modules/errors";

export default async (interaction: CommandInteraction) => {
  try {
    const commandName = interaction.commandName;

    console.log(">> Executing Command:", commandName);

    const command = Commands.find(
      (command) => command.data.name === commandName
    );

    if (!command) {
      console.log(">> Command not found", commandName);
      await interaction.reply("Command not found");
      return;
    }

    command.execute(interaction);
  } catch (error: any) {
    if (error instanceof UserError) {
      await interaction.reply(error.message);
      return;
    }
    const time = Date.now();
    console.error(`Command error: ${error}|\n At:${time}`);
    await interaction.reply(`Internal bot error. At:${time}`);
  }
};
