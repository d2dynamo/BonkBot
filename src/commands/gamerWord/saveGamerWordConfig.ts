import {
  ApplicationCommandOptionType,
  CommandInteraction,
  SlashCommandNumberOption,
  SlashCommandStringOption,
} from "discord.js";

import Command, { CommandExecute } from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import { stringToObjectIdSync } from "../../modules/database/mongo";
import {
  SaveGamerWordConfig,
  saveGamerWordConfig,
} from "../../modules/guild/gamerWordConfig";

const execute: CommandExecute = async (
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) => {
  const wordOpt = interaction.options.get("guild-gamer-word");

  if (
    !wordOpt ||
    wordOpt.type !== ApplicationCommandOptionType.String ||
    !wordOpt.value
  ) {
    interaction.reply("No gamer word specified.");
    return;
  }

  const wordOptValue = wordOpt.value as string;

  const gamerWordObjId = stringToObjectIdSync(wordOptValue);

  if (!gamerWordObjId) {
    interaction.reply("Invalid gamer word id.");
    return;
  }

  const config: SaveGamerWordConfig = {};

  const costOpt = interaction.options.get("cost");

  if (
    costOpt &&
    costOpt.type !== ApplicationCommandOptionType.Number &&
    !costOpt.value
  ) {
    interaction.reply("Invalid cost.");
    return;
  }

  const cost = costOpt?.value as number;

  if (cost) {
    config.cost = cost;
  }

  const responseOpt = interaction.options.get("response");

  if (
    responseOpt &&
    responseOpt.type !== ApplicationCommandOptionType.String &&
    !responseOpt.value
  ) {
    interaction.reply("Invalid response.");
    return;
  }

  const response = responseOpt?.value as string;

  if (response) {
    config.response = response;
  }

  await saveGamerWordConfig(guildDID, gamerWordObjId, config);

  interaction.reply("Subscribed to gamer word.");
};

const options = [
  new SlashCommandStringOption()
    .setName("guild-gamer-word")
    .setDescription("The gamer word to configure")
    .setAutocomplete(true)
    .setRequired(true),
  new SlashCommandNumberOption()
    .setName("cost")
    .setDescription("The cost of the gamer word")
    .setRequired(false),
  new SlashCommandStringOption()
    .setName("response")
    .setDescription("The response to give when the gamer word is said")
    .setRequired(false),
];

export default new Command({
  name: "save-word-config",
  description: "Save gamer word config for the guild",
  options,
  execute,
  requiredPermission: PermissionsEnum.admin,
});
