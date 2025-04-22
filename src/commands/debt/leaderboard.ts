import { CommandInteraction, EmbedBuilder } from 'discord.js';

import Command, { CommandExecute } from '../../modules/command';
import { PermissionsEnum } from '../../modules/permissions/permissions';
import { listDebts } from '../../modules/debtWallet';

const execute: CommandExecute = async (
  interaction: CommandInteraction,
  interactorDID: string,
  guildDID: string
) => {
  const debtList = await listDebts({
    guildDID,
  });

  if (!debtList) {
    await interaction.reply({
      content: 'No debts found.',
      ephemeral: true,
    });
    return;
  }

  const sortedList = debtList.sort((a, b) => b.balance - a.balance);

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('Debt Leaderboard')
    .setDescription('Top 10 debtors')
    .setTimestamp();

  sortedList.slice(0, 10).forEach((debt, index) => {
    embed.addFields({
      name: `${index + 1}. ${debt.userName}`,
      value: `Balance: ${debt.balance}`,
    });
  });

  await interaction.reply({ embeds: [embed] });
};

export default new Command({
  name: 'bd-lb',
  description: 'Debt leaderboard',
  options: null,
  execute,
  requiredPermission: PermissionsEnum.basic,
});
