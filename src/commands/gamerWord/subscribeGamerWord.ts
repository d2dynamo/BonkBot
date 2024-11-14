import {
  ApplicationCommandOptionType,
  CommandInteraction,
  SlashCommandStringOption,
} from "discord.js";

import Command, { CommandExecute } from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import { subscribeGamerWord } from "../../modules/guild/gamerWordConfig";
import { stringToObjectIdSync } from "../../modules/database/mongo";

const execute: CommandExecute = async (
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) => {
  const wordOpt = interaction.options.get("gamer-word");

  if (
    !wordOpt ||
    wordOpt.type !== ApplicationCommandOptionType.String ||
    !wordOpt.value
  ) {
    interaction.reply("No gamer word specified.");
    return;
  }

  const wordOptValue = wordOpt.value as string;
  // TODO: Repeat this pattern in other commands: check type and the value exists and assert type.

  const gamerWordObjId = stringToObjectIdSync(wordOptValue);

  if (!gamerWordObjId) {
    interaction.reply("Invalid gamer word id.");
    return;
  }

  await subscribeGamerWord(guildDID, gamerWordObjId);

  interaction.reply("Subscribed to gamer word.");
};

const options = [
  new SlashCommandStringOption()
    .setName("gamer-word")
    .setDescription("The gamer word to subscribe to")
    .setAutocomplete(true)
    .setRequired(true),
];

export default new Command({
  name: "subscribe-gamer-word",
  description: "Subscribe to a gamer word",
  options,
  execute,
  requiredPermission: PermissionsEnum.admin,
});
