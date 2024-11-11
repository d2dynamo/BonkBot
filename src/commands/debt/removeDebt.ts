import {
  ApplicationCommandOptionType,
  CommandInteraction,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "discord.js";

import { PermissionsEnum } from "../../modules/permissions/permissions";
import Command from "../../modules/command";
import { updateUserWallet } from "../../modules/debtWallet/update";
import parseDiscordUID from "../../modules/users/userId";
import { getUserWallet } from "../../modules/debtWallet/get";

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
    interaction.reply("User wallet not found");
    throw Error(`User wallet not found. ${userDID} ${guildDID}`);
  }

  let change = amount.value;

  if (typeof change !== "number") {
    throw new Error("Amount must be a number");
  }

  if (change > 0) {
    change = -change;
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
    `Removed debt for ${
      userOpt.user.username
    }. New balance: ${(userWallet.balance += change)}`
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
  new SlashCommandStringOption()
    .setName("note")
    .setDescription("A note to attach to the transaction")
    .setRequired(false),
];

export default new Command({
  name: "bd-remove",
  description: "Remove debt from a user",
  options,
  execute,
  requiredPermission: PermissionsEnum.banker,
});
