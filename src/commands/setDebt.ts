import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { BonkDebtWallet } from "../interfaces/database";
import { LoadBonkDebtWalletsOld, SaveBonkDebtOld } from "../modules/BonkDebt";

/* TODO: 

*/
let debtWallets: BonkDebtWallet[] = [];
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

  execute(interaction: CommandInteraction) {
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

    // ensure amount.value is a number
    if (typeof amount.value !== "number") {
      interaction.reply("Amount must be a number");
      return;
    }

    debtWallets = LoadBonkDebtWalletsOld();

    const userWalletIndex = debtWallets.findIndex(
      (wallet) => wallet.userId === user.id
    );

    const userWallet = debtWallets[userWalletIndex];
    if (!userWallet) {
      debtWallets.push({
        userId: user.id,
        balance: amount.value,
        lastUpdated: Date.now(),
      });
    } else {
      userWallet.balance = amount.value;
      userWallet.lastUpdated = Date.now();
      debtWallets[userWalletIndex] = userWallet;
    }

    SaveBonkDebtOld(debtWallets);
    interaction.reply(`Set debt for ${user.username} to ${amount.value}`);
  },
};
