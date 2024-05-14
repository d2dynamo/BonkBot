import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import getUserWallet from "../modules/debtWallet/get";
import parseUserId from "../modules/users/userId";
import createWallet from "../modules/debtWallet/create";

export default {
  data: new SlashCommandBuilder()
    .setName("bd-load")
    .setDescription("Load debt for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to load debt for")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user");
    if (!user) {
      interaction.reply("No user specified");
      return;
    }

    console.log("user", user);

    const userWallet = await getUserWallet(parseUserId(user.id));

    if (!userWallet) {
      interaction.reply("User wallet not found");
      createWallet(parseUserId(user.id));
      return;
    }

    if (typeof userWallet.balance !== "number" || userWallet.balance === 0) {
      interaction.reply(`${user.username} har ingen skuld`);
      return;
    }

    interaction.reply(
      `${user.username} är i skuld med ${userWallet.balance} kronor.`
    );
  },
};
