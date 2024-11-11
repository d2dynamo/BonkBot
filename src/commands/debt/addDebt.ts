import {
  CommandInteraction,
  SlashCommandUserOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  ApplicationCommandOptionType,
} from "discord.js";

import { getUserWallet } from "../../modules/debtWallet/get";
import { updateUserWallet } from "../../modules/debtWallet/update";
import Command from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import parseDiscordUID from "../../modules/users/userId";

async function execute(
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) {
  const userOpt = interaction.options.get("user");
  if (
    !userOpt ||
    userOpt.type !== ApplicationCommandOptionType.User ||
    !userOpt.user
  ) {
    interaction.reply("No user specified.");
    return;
  }

  const userDID = parseDiscordUID(userOpt.user.id);

  const amount = interaction.options.get("amount");

  if (
    !amount ||
    amount.type !== ApplicationCommandOptionType.Number ||
    typeof amount.value !== "number"
  ) {
    interaction.reply("Missing amount option. Or amount is not a number.");
    return;
  }

  const userWallet = await getUserWallet(userDID, guildDID);

  if (!userWallet) {
    interaction.reply("User wallet not found.");
    throw Error(`User wallet not found. ${userDID} ${guildDID}`);
  }

  let change = amount.value;

  if (typeof change !== "number" || change < 0) {
    throw new Error("Amount must be a positive number");
  }

  const note = interaction.options.get("note", false);

  await updateUserWallet(
    userDID,
    guildDID,
    interactorDID,
    change,
    typeof note?.value === "string" ? note.value : undefined
  );

  interaction.reply(
    `Added debt for ${userOpt.user.username}. New balance: ${
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
  new SlashCommandStringOption()
    .setName("note")
    .setDescription("A note to add to the transaction")
    .setRequired(false),
];

export default new Command({
  name: "bd-add",
  description: "Add debt for a user",
  options,
  execute,
  requiredPermission: PermissionsEnum.basic,
});
