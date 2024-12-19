import { Message } from "discord.js";
import GamerWord from "../modules/gamerWord/gamerWord";
import { GamerWordDefaultResponse } from "../constants/defaults";
import { listAndBuildGamerWords } from "../modules/gamerWord/list";
import { updateUserWallet, updateWallet } from "../modules/debtWallet/update";
import { getUserWallet } from "../modules/debtWallet/get";
import { createWallet } from "../modules/debtWallet/create";

let lastPing = Date.now() - 5000;

async function checkForGamerWords(message: Message): Promise<GamerWord[]> {
  const matchedGamerWords: GamerWord[] = [];
  const words = message.content.split(" ");
  if (!message.guildId) {
    throw Error("Message missing guildId.");
  }
  const gamerWords = await listAndBuildGamerWords(message.guildId);
  if (!gamerWords.length) {
    return [];
  }

  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < gamerWords.length; j++) {
      if (gamerWords[j].phrases.includes(words[i])) {
        matchedGamerWords.push(gamerWords[j]);
      }
    }
  }

  return matchedGamerWords;
}

export default async (message: Message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    const now = Date.now();

    if (now - lastPing < 1000 * 10) {
      return;
    }

    message.reply(`Pong!`);
    lastPing = now;
    return;
  }

  const matchedGamerWords = await checkForGamerWords(message);

  if (!matchedGamerWords.length) {
    return;
  }

  let totalCost = 0;
  for (let i = 0; i < matchedGamerWords.length; i++) {
    totalCost += matchedGamerWords[i].cost;
  }

  const userDID = message.author.id;
  const guildDID = message.guildId;

  if (!guildDID || !userDID) {
    console.error(
      "guildId or userId not found on message create",
      message.author
    );
    return;
  }

  const firstGamerWord = matchedGamerWords[0];
  message.reply(
    `${
      firstGamerWord.response ?? GamerWordDefaultResponse
    }. Your wallet is getting bonked for ${totalCost}.`
  );

  try {
    const userWallet = await getUserWallet(userDID, guildDID);

    await updateWallet(
      userWallet.id,
      userDID,
      guildDID,
      totalCost,
      `NoNo message: ${message.id}`
    );
  } catch (err: any) {
    if (err.message && err.message === "Wallet not found") {
      console.log("Wallet not found, creating wallet for", userDID);
      await createWallet(userDID, guildDID);
      await updateUserWallet(
        userDID,
        guildDID,
        userDID,
        totalCost,
        `NoNo message: ${message.id}`
      );
    } else {
      throw err;
    }
  }
};
