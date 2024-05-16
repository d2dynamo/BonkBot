import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import getUserWallet from "../modules/debtWallet/get";
import parseUserId from "../modules/users/userId";
import createWallet from "../modules/debtWallet/create";
import updateUserWallet from "../modules/debtWallet/update";

export default {
  data: new SlashCommandBuilder()
    .setName("bd-set")
    .setDescription("Set debt for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to set debt for")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to set the debt to")
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
  },
};
