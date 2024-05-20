import drizzledb, { DatabaseType } from "../database/drizzle";
import { permissions } from "../database/schema";
import { Permission } from "../../interfaces/database";

/**
 * Lists all available permissions
 * @returns {Promise<Permission[]>} Permissions array promise
 */
export default async function listPermissions(): Promise<Permission[]> {
  const db = drizzledb(DatabaseType.bonkDb);

  const result = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      createdAt: permissions.createdAt,
      updatedAt: permissions.updatedAt,
    })
    .from(permissions);

  const permsArr =
    result.map((perm) => {
      return {
        id: perm.id,
        name: perm.name,
        createdAt: perm.createdAt,
        updatedAt: perm.updatedAt,
      };
    }) || [];

  return permsArr;
}
