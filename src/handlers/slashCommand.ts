import { CommandInteraction } from "discord.js";

import Commands from "../commands";
import { UserError } from "../modules/errors";

export default async (interaction: CommandInteraction) => {
  try {
    const commandName = interaction.commandName;
    console.log(">> Command name", commandName);

    const command = Commands.find(
      (command) => command.data.name === commandName
    );

    if (!command) {
      console.log(">> Command not found", commandName);
      await interaction.reply("Command not found");
      return;
    }

    await command.exec(interaction);
  } catch (error: any) {
    if (error instanceof UserError) {
      await interaction.reply(error.message);
      return;
    }
    const time = Date.now();
    console.error(`${time}: Error in slashCommand`, error);
    await interaction.reply(`Internal bot error. timestamp:${time}`);
  }
};
