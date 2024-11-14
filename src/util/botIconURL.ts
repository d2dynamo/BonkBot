import { type Client } from "discord.js";

export default function (client: Client<true>): string {
  return `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png`;
}
