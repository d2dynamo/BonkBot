import {
  ApplicationCommandOptionType,
  CommandInteraction,
  SlashCommandUserOption,
} from "discord.js";

import parseDiscordUID from "../../modules/users/userId";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import Command from "../../modules/command";
import { getUserWallet } from "../../modules/debtWallet/get";
import { createWallet } from "../../modules/debtWallet/create";

async function execute(
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) {
  const userOpt = interaction.options.get("user");
  if (
    !userOpt ||
    userOpt.type !== ApplicationCommandOptionType.User ||
    !userOpt.user
  ) {
    interaction.reply("No user specified.");
    return;
  }

  const userDID = parseDiscordUID(userOpt.user.id);

  const userWallet = await getUserWallet(userDID, guildDID);

  if (!userWallet) {
    await createWallet(userDID, guildDID);
  }

  if (typeof userWallet.balance !== "number" || userWallet.balance === 0) {
    interaction.reply(`${userOpt.user.username} has no swear jar debt.`);
    return;
  }

  const reply =
    userWallet.balance >= 666
      ? `Uh-oh, we got a real punk here! You need to wash your mouth with soap. Your debt is ${userWallet.balance}`
      : `${userOpt.user.username} has ${userWallet.balance} in their swear jar.`;

  interaction.reply(reply);
}

const options = [
  new SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to load debt for")
    .setRequired(true),
];

export default new Command({
  name: "bd-load",
  description: "Load debt for a user",
  options,
  execute,
  requiredPermission: PermissionsEnum.basic,
});
