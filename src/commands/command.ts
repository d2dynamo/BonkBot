import { CommandInteraction } from "discord.js";
// TODO: Make commands cleaner by using a Command class to construct them. Also create folders for each separate command maybe?
export default class Command {
  readonly data: {
    name: string;
    description: string;
    options: {
      name: string;
      description: string;
      type: number;
      required: boolean;
    }[];
  };
  readonly execute: (interaction: CommandInteraction) => void;

  constructor(
    data: {
      name: string;
      description: string;
      options: {
        name: string;
        description: string;
        type: number;
        required: boolean;
      }[];
    },
    execute: (interaction: CommandInteraction) => void
  ) {
    this.data = data;
    this.execute = execute;
  }
}
