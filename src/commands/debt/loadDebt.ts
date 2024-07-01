import { CommandInteraction, SlashCommandUserOption } from "discord.js";
import getUserWallet from "../../modules/debtWallet/get";
import parseDiscordUID from "../../modules/users/userId";
import createWallet from "../../modules/debtWallet/create";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import Command from "../command";

async function execute(interaction: CommandInteraction) {
  const user = interaction.options.getUser("user");
  if (!user) {
    interaction.reply("No user specified");
    return;
  }

  const userWallet = await getUserWallet(parseDiscordUID(user.id));

  if (!userWallet) {
    interaction.reply("User wallet not found");
    createWallet(parseDiscordUID(user.id));
    return;
  }

  if (typeof userWallet.balance !== "number" || userWallet.balance === 0) {
    interaction.reply(`${user.username} has no swear jar debt.`);
    return;
  }

  const reply =
    userWallet.balance >= 666
      ? `Uh-oh, we got a real punk here! You need to wash your mouth with soap. Your debt is ${userWallet.balance}`
      : `${user.username} has ${userWallet.balance} in their swear jar.`;

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
