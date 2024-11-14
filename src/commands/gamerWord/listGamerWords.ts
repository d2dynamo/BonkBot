import { CommandInteraction } from "discord.js";

import Command from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import { listGamerWordsFull } from "../../modules/gamerWord/list";

async function execute(interaction: CommandInteraction) {
  const gWords = await listGamerWordsFull();

  const replyStr = gWords
    .map((gWord) => {
      let wstr = `${gWord.word}; id:${gWord._id} :`;
      for (let i = 0; i < gWord.phrases.length; i++) {
        if (i === 7) {
          wstr += "\n";
        }
        wstr += ` ${gWord.phrases[i]}|`;
      }
    })
    .join("\n");

  interaction.reply(replyStr);
}

export default new Command({
  name: "list-gamer-words",
  description: "List all gamer words",
  options: null,
  execute,
  requiredPermission: PermissionsEnum.basic,
});
