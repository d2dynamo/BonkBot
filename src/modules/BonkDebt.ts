import fs from "fs";
import { BonkDebtWallet } from "../interfaces/database";

// This is a shitty thing local cold storage stuff

export function LoadBonkDebtWallets(): BonkDebtWallet[] {
  const loaded = JSON.parse(fs.readFileSync("d:/bonkdebt.json", "utf8"));
  const validated: BonkDebtWallet[] = [];

  if (!loaded || !Array.isArray(loaded)) {
    return [];
  }

  for (let i = 0; i < loaded.length; i++) {
    const item = loaded[i];
    if (
      typeof item.userId === "string" &&
      typeof item.balance === "number" &&
      typeof item.lastUpdated === "number"
    ) {
      validated.push(item);
    }
  }

  return validated;
}

export function SaveBonkDebt(data: BonkDebtWallet[]) {
  fs.writeFileSync("d:/bonkdebt.json", JSON.stringify(data));
}
