import {
  CommandInteraction,
  SlashCommandNumberOption,
  SlashCommandUserOption,
} from "discord.js";
import getUserWallet from "../../modules/debtWallet/get";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import Command from "../../modules/command";
import { updateUserWallet } from "../../modules/debtWallet/update";

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

  if (change > 0) {
    change = -change;
  }

  await updateUserWallet(user.id, change, interaction.user.id);

  interaction.reply(
    `Removed debt for ${user.username}. New balance: ${
      userWallet.balance - change
    }`
  );
}

const options = [
  new SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to remove debt from")
    .setRequired(true),
  new SlashCommandNumberOption()
    .setName("amount")
    .setDescription("The amount to remove from the debt")
    .setRequired(true),
];

export default new Command({
  name: "bd-remove",
  description: "Remove debt from a user",
  options,
  execute,
  requiredPermission: PermissionsEnum.banker,
});
