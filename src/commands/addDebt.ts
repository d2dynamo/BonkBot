import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { BonkDebtWallet } from "../interfaces/database";
import { SaveBonkDebt, LoadBonkDebtWallets } from "../modules/BonkDebt";

/* TODO: load debt for a user. If no user specified, load debt for the user who ran the command-
  Save debt for a specified user. Only certain users can run this command.
*/
let debtWallets: BonkDebtWallet[] = [];
export default {
  data: new SlashCommandBuilder()
    .setName("bd-add")
    .setDescription("Add debt for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to load debt for")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to add to the debt")
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

    if (typeof amount.value !== "number") {
      interaction.reply("Amount must be a number");
      return;
    }

    debtWallets = LoadBonkDebtWallets();

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
      if (!userWallet.balance) {
        userWallet.balance = 0;
      }

      userWallet.balance += amount.value;
      userWallet.lastUpdated = Date.now();
      debtWallets[userWalletIndex] = userWallet;
    }

    SaveBonkDebt(debtWallets);

    interaction.reply(`Added debt for ${user.username}`);
  },
};
