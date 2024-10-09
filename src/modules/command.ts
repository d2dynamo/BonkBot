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

interface CommandOptions {
  name: string;
  description: string;
  options: SlashCommandOptions[] | null;
  execute: (interaction: CommandInteraction) => Promise<void>;
  requiredPermission?: PermissionsEnum;
}

/**
 * Command class.
 * Automatically checks if the user has the required permissions to execute the command.
 */
export default class Command {
  readonly data: SlashCommandBuilder;
  readonly execute: (interaction: CommandInteraction) => Promise<void>;
  readonly requiredPermission: PermissionsEnum;

  constructor({
    name,
    description,
    options,
    execute,
    requiredPermission,
  }: CommandOptions) {
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

  async exec(interaction: CommandInteraction) {
    const interactor = interaction.user;

    if (!(await checkUserPermission(interactor.id, this.requiredPermission))) {
      interaction.reply("You do not have permission to use this command");
      return;
    }

    await this.execute(interaction);
  }
}
