import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import getUserWallet from "../modules/debtWallet/get";
import updateUserWallet from "../modules/debtWallet/update";

export default {
  data: new SlashCommandBuilder()
    .setName("bd-remove")
    .setDescription("Remove debt for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove debt from")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to remove from the debt")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
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

    let newBalance = userWallet.balance - amount.value;

    await updateUserWallet(user.id, newBalance, interaction.user.id);

    interaction.reply(
      `Removed debt for ${user.username}. New balance: ${newBalance}`
    );
  },
};
