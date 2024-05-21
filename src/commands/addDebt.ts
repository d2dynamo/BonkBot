import {
  CommandInteraction,
  SlashCommandUserOption,
  SlashCommandNumberOption,
} from "discord.js";

import getUserWallet from "../modules/debtWallet/get";
import updateUserWallet from "../modules/debtWallet/update";
import Command from "./command";
import { PermissionsEnum } from "../modules/permissions/permissions";

async function execute(interaction: CommandInteraction) {
  const user = interaction.options.getUser("user");
  if (!user) {
    interaction.reply("No user specified");
    return;
  }

  const amount = interaction.options.get("amount");

  if (!amount) {
    interaction.reply("No amount specified");
    return;
  }

  if (typeof amount.value !== "number") {
    interaction.reply("Amount must be a number");
    return;
  }

  const userWallet = await getUserWallet(user.id);

  if (!userWallet) {
    interaction.reply("User wallet not found");
    return;
  }

  let newBalance = amount.value;

  if (typeof userWallet.balance === "number") {
    newBalance += userWallet.balance;
  }

  await updateUserWallet(user.id, newBalance, interaction.user.id);

  interaction.reply(
    `Added debt for ${user.username}. New balance: ${newBalance}`
  );
}

const options = [
  new SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to add debt to")
    .setRequired(true),
  new SlashCommandNumberOption()
    .setName("amount")
    .setDescription("The amount to add to the debt")
    .setRequired(true),
];

export default new Command({
  name: "bd-add",
  description: "Add debt for a user",
  options,
  execute,
  requiredPermission: PermissionsEnum.basic,
});
