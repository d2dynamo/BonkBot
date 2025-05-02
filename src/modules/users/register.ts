import { Guild } from 'discord.js';

import parseDiscordUID from '../discordUID';
import saveUser from './create';
import { getUserWallet } from '../debtWallet/get';
import { createWallet } from '../debtWallet/create';
import { changeUserPermissions } from './update';
import { PermissionsEnum } from '../permissions/permissions';
import { stringToObjectIdSyncForce } from '../database/mongo';
import { checkUserPermission } from './get';

/**
 * Register users from a guild.
 */
export default async function registerUsersFromGuild(guild: Guild) {
  try {
    const m = await guild.members.fetch();
    const members = Array.from(m.values());

    for (let j = 0; j < members.length; j++) {
      const member = members[j];

      if (member.user.bot) {
        continue;
      }

      try {
        // This is an upsert so if user doesnt exist- creates user; otherwise updates displayname.
        await saveUser(
          parseDiscordUID(member.id),
          guild.id,
          member.user.username,
          member.user.displayName
        );

        await getUserWallet(parseDiscordUID(member.id), guild.id);

        if (
          !(await checkUserPermission(
            parseDiscordUID(member.id),
            guild.id,
            stringToObjectIdSyncForce(PermissionsEnum.basic)
          ))
        ) {
          await changeUserPermissions(parseDiscordUID(member.id), guild.id, {
            permissionId:
              member.id === guild.ownerId
                ? stringToObjectIdSyncForce(PermissionsEnum.admin)
                : stringToObjectIdSyncForce(PermissionsEnum.basic),
            active: true,
          });
        }
      } catch (error: any) {
        if ((error.message as string).includes('Wallet not found')) {
          await createWallet(parseDiscordUID(member.id), guild.id);
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('>> Error registering users', error);
  }
}
