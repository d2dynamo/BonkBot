import { CommandInteraction, EmbedBuilder } from "discord.js";

import Command, { CommandExecute } from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import { listGuildGamerWords } from "../../modules/gamerWord/list";
import { botIconURL } from "../../util";

const execute: CommandExecute = async (
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) => {
  const guildWords = await listGuildGamerWords(guildDID);

  const embedReply = new EmbedBuilder()
    .setTitle("Gamer Words")
    .setAuthor({
      name: "Bonk Bot",
      iconURL: botIconURL(interaction.client),
    })
    .setDescription("List of guild gamer words");

  for (let i = 0; i < guildWords.length; i++) {
    const gWord = guildWords[i];
    let wstr = `${gWord.word}. id: ${gWord.id}`;
    embedReply.addFields({ name: "Word", value: wstr });

    embedReply.addFields({ name: "Phrases", value: gWord.phrases.join(", ") });
  }

  interaction.reply("Subscribed to gamer word.");
};

export default new Command({
  name: "list-guild-words",
  description: "List guild gamer words",
  options: null,
  execute,
  requiredPermission: PermissionsEnum.basic,
});
