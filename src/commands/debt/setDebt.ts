import {
  ApplicationCommandOptionType,
  CommandInteraction,
  SlashCommandNumberOption,
  SlashCommandUserOption,
} from "discord.js";

import { PermissionsEnum } from "../../modules/permissions/permissions";
import Command from "../../modules/command";
import { updateUserWallet } from "../../modules/debtWallet/update";
import parseDiscordUID from "../../modules/users/userId";
import { getUserWallet } from "../../modules/debtWallet/get";
import { createWallet } from "../../modules/debtWallet/create";

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

  try {
    const userWallet = await getUserWallet(userDID, guildDID);

    if (!userWallet) {
      throw new Error("Wallet not found");
    }

    const target = amount.value;
    const current = userWallet.balance;

    if (typeof target !== "number") {
      throw new Error("Amount must be a number");
    }

    let change = target;
    if (target > current) {
      change = target - current;
    } else if (target < current) {
      change = current - target;
    }

    const note = interaction.options.get("note", false);

    await updateUserWallet(
      userDID,
      guildDID,
      interactorDID,
      change,
      typeof note === "string" ? note : undefined
    );
  } catch (error: any) {
    if (error.message === "Wallet not found") {
      await createWallet(userDID, guildDID);
      await updateUserWallet(userDID, guildDID, interactorDID, amount.value);
    } else {
      throw error;
    }
  }

  interaction.reply(`Set debt for ${userOpt.user.username} to ${amount.value}`);
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
