import { AutocompleteInteraction } from "discord.js";
import {
  listGamerWordsOptions,
  listGuildGamerWordsOptions,
} from "../modules/gamerWord/list";

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
    case "guild-gamer-word":
      await guildGamerWord(interaction);
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

  if (!filteredOptions.length) {
    return;
  }

  await interaction.respond(filteredOptions);
}

async function guildGamerWord(interaction: AutocompleteInteraction) {
  if (!interaction.guildId) {
    return;
  }

  const options = await listGuildGamerWordsOptions(interaction.guildId);

  const focusedOption = interaction.options.getFocused(true);

  if (!focusedOption) {
    await interaction.respond(options);
    return;
  }

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(focusedOption.value.toLowerCase())
  );

  if (!filteredOptions.length) {
    return;
  }

  await interaction.respond(filteredOptions);
}
