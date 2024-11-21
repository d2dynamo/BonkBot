import { CommandInteraction, EmbedBuilder } from "discord.js";

import Command, { CommandExecute } from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import { listGamerWordsFull } from "../../modules/gamerWord/list";
import { botIconURL } from "../../util";

const execute: CommandExecute = async (
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) => {
  const gWords = await listGamerWordsFull();

  const embedReply = new EmbedBuilder()
    .setTitle("Gamer Words")
    .setAuthor({
      name: "Bonk Bot",
      iconURL: botIconURL(interaction.client),
    })
    .setDescription("List of all gamer words");

  for (let i = 0; i < gWords.length; i++) {
    const gWord = gWords[i];
    let wstr = `${gWord.word}. id: ${gWord._id}`;
    embedReply.addFields({ name: "Word", value: wstr });

    embedReply.addFields({ name: "Phrases", value: gWord.phrases.join(", ") });
  }

  await interaction.reply({ embeds: [embedReply] });
};

export default new Command({
  name: "list-gamer-words",
  description: "List all gamer words",
  options: null,
  execute,
  requiredPermission: PermissionsEnum.basic,
});
