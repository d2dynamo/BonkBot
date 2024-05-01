import {
  SlashCommandBuilder,
  Interaction,
  CommandInteraction,
} from "discord.js";
import { BonkDebtWallet } from "../interfaces/database";
import { LoadBonkDebtWallets } from "../modules/BonkDebt";

/* TODO: load debt for a user. If no user specified, load debt for the user who ran the command-
  Save debt for a specified user. Only certain users can run this command.
*/
let debtWallets: BonkDebtWallet[] = [];
let lastUpdatedWallets = Date.now();
export const data = new SlashCommandBuilder()
  .setName("db-load")
  .setDescription("Load debt for a user")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The user to load debt for")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  const user = interaction.options.getUser("user");
  if (!user) {
    interaction.reply("No user specified");
    return;
  }

  if (Date.now() - lastUpdatedWallets > 60000) {
    debtWallets = LoadBonkDebtWallets();
    lastUpdatedWallets = Date.now();
  }

  const userWallet = debtWallets.find((wallet) => wallet.userId === user.id);
  if (!userWallet || userWallet.balance === 0) {
    interaction.reply(`${user.username} has no debt`);
    return;
  }

  interaction.reply(`Loading debt for ${user.username}`);
}
