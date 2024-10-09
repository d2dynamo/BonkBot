import {
  CommandInteraction,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from "discord.js";

import Command from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import addPhrasesToGamerWord from "../../modules/gamerWord/update";

async function execute(interaction: CommandInteraction) {
  const wordId = interaction.options.get("word-id");

  if (!wordId || typeof wordId.value !== "number") {
    interaction.reply("No word id specified");
    return;
  }

  const phrase = interaction.options.get("phrase");

  if (!phrase || typeof phrase.value !== "string") {
    interaction.reply("No phrase specified");
    return;
  }

  await addPhrasesToGamerWord(wordId.value, [phrase.value]);

  interaction.reply("Added phrase to gamer word");
}

const options = [
  new SlashCommandIntegerOption()
    .setName("word-id")
    .setDescription("The gamer word id to add phrase to")
    .setRequired(true),
  new SlashCommandStringOption()
    .setName("phrase")
    .setDescription("The phrase to add")
    .setRequired(true),
];

export default new Command({
  name: "add-phrase",
  description: "Add phrase to a gamer word",
  options,
  execute,
  requiredPermission: PermissionsEnum.bigHoncho,
});
