import {
  CommandInteraction,
  SlashCommandUserOption,
  SlashCommandNumberOption,
} from "discord.js";

import getUserWallet from "../../modules/debtWallet/get";
import { updateUserWallet } from "../../modules/debtWallet/update";
import Command from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";

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

  let change = amount.value;

  if (typeof change !== "number") {
    throw new Error("Amount must be a number");
  }

  await updateUserWallet(user.id, change, interaction.user.id);

  interaction.reply(
    `Added debt for ${user.username}. New balance: ${
      change + userWallet.balance
    }`
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
