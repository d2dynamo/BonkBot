import { AutocompleteInteraction } from "discord.js";
import { listGamerWordsOptions } from "../modules/gamerWord/list";

export default async function (
  interaction: AutocompleteInteraction
): Promise<void> {
  if (!interaction.commandName) {
    return;
  }

  switch (interaction.commandName) {
    case "subscribe-gamer-word":
      await subscribeGamerWord(interaction);
      break;
    default:
      break;
  }
}

async function subscribeGamerWord(interaction: AutocompleteInteraction) {
  const options = await listGamerWordsOptions();

  const focusedOption = interaction.options.getFocused(true);

  if (!focusedOption) {
    await interaction.respond(options);
    return;
  }

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(focusedOption.value.toLowerCase())
  );

  await interaction.respond(filteredOptions);
}
