import {
  CommandInteraction,
  SlashCommandNumberOption,
  SlashCommandUserOption,
} from "discord.js";
import getUserWallet from "../../modules/debtWallet/get";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import Command from "../../modules/command";
import updateUserWallet from "../../modules/debtWallet/update";
import createWallet from "../../modules/debtWallet/create";

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

  try {
    await getUserWallet(user.id);

    await updateUserWallet(user.id, amount.value, interaction.user.id);
  } catch (error: any) {
    if (error.message === "Wallet not found") {
      await createWallet(user.id);
      await updateUserWallet(user.id, amount.value, interaction.user.id);
    } else {
      console.error(error);
      interaction.reply("Failed to set debt");
      return;
    }
  }

  interaction.reply(`Set debt for ${user.username} to ${amount.value}`);
}

const options = [
  new SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to set debt for")
    .setRequired(true),
  new SlashCommandNumberOption()
    .setName("amount")
    .setDescription("The amount to set the debt to")
    .setRequired(true),
];

export default new Command({
  name: "bd-set",
  description: "Set debt for a user",
  options,
  execute,
  requiredPermission: PermissionsEnum.banker,
});
