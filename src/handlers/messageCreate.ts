import { Message } from "discord.js";
import GamerWord from "../modules/gamerWord/gamerWord";
import { GamerWordDefaultResponse } from "../constants/defaults";
import listAndBuildGamerWords from "../modules/gamerWord/list";
import { updateUserWallet, updateWallet } from "../modules/debtWallet/update";
import { getUserWallet } from "../modules/debtWallet/get";
import { createWallet } from "../modules/debtWallet/create";

let lastPing = Date.now();

async function checkForGamerWords(message: Message): Promise<GamerWord[]> {
  const matchedGamerWords: GamerWord[] = [];
  const words = message.content.split(" ");
  const gamerWords = await listAndBuildGamerWords();

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

    if (now - lastPing > 5000) {
      return;
    }

    message.reply(`Pong!`);
    lastPing = now;
  }

  const matchedGamerWords = await checkForGamerWords(message);

  if (!matchedGamerWords.length) {
    return;
  }

  let totalCost = 0;
  for (let i = 0; i < matchedGamerWords.length; i++) {
    totalCost += matchedGamerWords[i].cost;
  }

  const userId = message.author.id;
  const guildId = message.guildId;

  if (!guildId || !userId) {
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
    const userWallet = await getUserWallet(userId, guildId);

    await updateWallet(
      userWallet.id,
      userId,
      guildId,
      totalCost,
      `NoNo message: ${message.id}`
    );
  } catch (err: any) {
    if (err.message && err.message === "Wallet not found") {
      console.log("Wallet not found, creating wallet for", userId);
      await createWallet(userId, guildId);
      await updateUserWallet(
        userId,
        guildId,
        userId,
        totalCost,
        `NoNo message: ${message.id}`
      );
    } else {
      throw err;
    }
  }
};
