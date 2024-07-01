import { eq } from "drizzle-orm";
import drizzledb, { DatabaseType } from "../database/drizzle";
import { users, bonkWallets } from "../database/schema";
import { DiscordUID } from "../../interfaces/database";
import parseDiscordUID from "../users/userId";

/**
 * Creates a wallet for a user with an optional starting balance.
 *
 * @param userId - Discord UID for who the wallet belongs to.
 * @param startingBalance - Initial balance of the wallet (default: 0).
 * @returns A promise that resolves to a boolean indicating success.
 */
export default async function createWallet(
  userId: DiscordUID
): Promise<boolean> {
  parseDiscordUID(userId);
  const db = drizzledb(DatabaseType.bonkDb);

  await db.transaction(async (tx) => {
    const user = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId));

    if (!user.length) {
      throw new Error("User does not exist.");
    }

    const createWalletResult = await tx.insert(bonkWallets).values({
      userId: userId,
    });

    if (createWalletResult.changes === 0) {
      throw new Error("Failed to create wallet.");
    }
  });

  return true;
}
