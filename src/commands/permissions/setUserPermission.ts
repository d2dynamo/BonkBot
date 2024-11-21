import {
  ApplicationCommandOptionType,
  CommandInteraction,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "discord.js";

import Command, { CommandExecute } from "../../modules/command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import { changeUserPermissions } from "../../modules/users/update";
import { stringToObjectId } from "../../modules/database/mongo";
import parseDiscordUID from "../../modules/discordUID";

const execute: CommandExecute = async (
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) => {
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

  const permissionId = interaction.options.get("permission-id");

  if (!permissionId || typeof permissionId.value !== "string") {
    interaction.reply("No permission id specified");
    return;
  }

  const permObjId = await stringToObjectId(permissionId.value);

  if (!permObjId) {
    interaction.reply("Invalid permission");
    return;
  }

  await changeUserPermissions(userDID, guildDID, [
    { permissionId: permObjId, active: true },
  ]);

  interaction.reply("Permission set.");
};

const options = [
  new SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to set the permission for.")
    .setRequired(true),
  new SlashCommandStringOption()
    .setName("permission-id")
    .setDescription("The permission to set for the user.")
    .setRequired(true)
    .setChoices(
      Object.entries(PermissionsEnum).map(([name, value]) => ({
        name,
        value,
      }))
    ),
];

export default new Command({
  name: "bonk-set-perm",
  description: "Set a users permission level.",
  options,
  execute,
  requiredPermission: PermissionsEnum.admin,
});
