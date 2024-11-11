/* !!NOTE!!
 * Currently the options resolver for CommandInteraction is weird and the resolvers for several options are omitted from the type definitions.
 * AKA, interaction.options.getUser("user") is not implemented according to type definitions but
 * interaction.options.getUser() DOES WORK. Cant be bothered to fix this so just ignore the error and keep coding.
 */

import {
  CommandInteraction,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "discord.js";
import { PermissionsEnum } from "./permissions/permissions";
import { checkUserPermission } from "./users/get";

type SlashCommandOptions =
  | SlashCommandStringOption
  | SlashCommandIntegerOption
  | SlashCommandBooleanOption
  | SlashCommandUserOption
  | SlashCommandChannelOption
  | SlashCommandRoleOption
  | SlashCommandMentionableOption
  | SlashCommandNumberOption;

export type CommandExecute = (
  interaction: CommandInteraction,
  interactorId: string,
  guildId: string
) => Promise<void>;

interface CommandConstructor {
  name: string;
  description: string;
  options: SlashCommandOptions[] | null;
  execute: CommandExecute;
  requiredPermission?: PermissionsEnum;
}

/**
 * Standard command class.
 * Use exec to run the command.
 * @class
 * @param {string} name
 * @param {string} description
 * @param {SlashCommandOptions[]} options
 * @param {CommandExecute} execute command execute function
 * @param {PermissionsEnum} requiredPermission required permission to run the command
 *
 * @method exec Run the command with the given interaction.
 */
export default class Command {
  readonly data: SlashCommandBuilder;
  readonly execute: CommandExecute;
  readonly requiredPermission: PermissionsEnum;

  constructor(cOpts: CommandConstructor) {
    const { name, description, options, execute, requiredPermission } = cOpts;
    this.data = new SlashCommandBuilder()
      .setName(name)
      .setDescription(description);

    this.execute = execute;

    const optionHandlers = new Map<
      string,
      (option: SlashCommandOptions) => void
    >([
      [
        "SlashCommandStringOption",
        (option) =>
          this.data.addStringOption(option as SlashCommandStringOption),
      ],
      [
        "SlashCommandIntegerOption",
        (option) =>
          this.data.addIntegerOption(option as SlashCommandIntegerOption),
      ],
      [
        "SlashCommandBooleanOption",
        (option) =>
          this.data.addBooleanOption(option as SlashCommandBooleanOption),
      ],
      [
        "SlashCommandUserOption",
        (option) => this.data.addUserOption(option as SlashCommandUserOption),
      ],
      [
        "SlashCommandChannelOption",
        (option) =>
          this.data.addChannelOption(option as SlashCommandChannelOption),
      ],
      [
        "SlashCommandRoleOption",
        (option) => this.data.addRoleOption(option as SlashCommandRoleOption),
      ],
      [
        "SlashCommandMentionableOption",
        (option) =>
          this.data.addMentionableOption(
            option as SlashCommandMentionableOption
          ),
      ],
      [
        "SlashCommandNumberOption",
        (option) =>
          this.data.addNumberOption(option as SlashCommandNumberOption),
      ],
    ]);

    if (options) {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];

        const handler = optionHandlers.get(option.constructor.name);
        if (handler) {
          handler(option);
        } else {
          throw new Error(
            `Unsupported option type: ${option.constructor.name}`
          );
        }
      }
    }

    if (!requiredPermission) {
      this.requiredPermission = PermissionsEnum.basic;
    } else {
      this.requiredPermission = requiredPermission;
    }
  }

  /**
   * Run the command with the given interaction.
   * @param interaction discord interaction
   * @returns void
   */
  async exec(interaction: CommandInteraction) {
    const interactorId = interaction.user.id;
    const guildId = interaction.guildId;

    if (!guildId) {
      interaction.reply("Internal error.");
      console.error("GuildId not found");
      return;
    }

    if (!interactorId) {
      interaction.reply("Internal error.");
      console.error(
        "InteractorId not found on interaction",
        interaction.commandName
      );
      return;
    }

    if (
      !(await checkUserPermission(
        interactorId,
        guildId,
        this.requiredPermission
      ))
    ) {
      interaction.reply("You do not have permission to use this command");
      return;
    }

    await this.execute(interaction, interactorId, guildId);
  }
}
