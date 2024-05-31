import {
  CommandInteraction,
  SlashCommandIntegerOption,
  SlashCommandUserOption,
} from "discord.js";

import Command from "../command";
import { PermissionsEnum } from "../../modules/permissions/permissions";
import { changeUserPermissions } from "../../modules/users/update";

async function execute(interaction: CommandInteraction) {
  const interactor = interaction.user;

  if (!interactor) {
    interaction.reply("No user found");
    return;
  }

  if (interactor.id !== "236201534470357003") {
    interaction.reply("Only biggest honcho may run this command.");
    return;
  }

  const user = interaction.options.getUser("user");
  const permissionId = interaction.options.get("permissionId");

  if (!user) {
    interaction.reply("No user specified");
    return;
  }

  if (!permissionId || typeof permissionId.value !== "number") {
    interaction.reply("No command id specified");
    return;
  }

  await changeUserPermissions(user.id, [
    { permissionId: permissionId.value, active: true },
  ]);
}

const options = [
  new SlashCommandUserOption()
    .setName("user")
    .setDescription("The gamer word id to add phrase to")
    .setRequired(true),
  new SlashCommandIntegerOption()
    .setName("permissionId")
    .setDescription("The permission to set for the user.")
    .setRequired(true),
];

export default new Command({
  name: "bonk-set-perm",
  description: "Set a users permission level.",
  options,
  execute,
  requiredPermission: PermissionsEnum.bigHoncho,
});
