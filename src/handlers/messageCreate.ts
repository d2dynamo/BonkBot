import { EmojiResolvable, Message } from "discord.js";
import gamerWords from "../constants/gamerWords";
import GamerWord from "../interfaces/GamerWord";
import { GamerWordDefaultResponse } from "../constants/defaults";
import emojis from "../constants/emojis";
import { LoadBonkDebtWallets, SaveBonkDebt } from "../modules/BonkDebt";

let lastPing = Date.now();

async function checkForGamerWords(message: Message): Promise<GamerWord[]> {
  const matchedGamerWords: GamerWord[] = [];
  const words = message.content.split(" ");

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
  if (matchedGamerWords.length) {
    //const totalCost = matchedGamerWords.reduce(
    //  (acc, curr) => acc + curr.cost,
    //  0
    //);

    let totalCost = 0;
    for (let i = 0; i < matchedGamerWords.length; i++) {
      totalCost += matchedGamerWords[i].cost;
    }
    const user = message.author;

    //const emoji: EmojiResolvable = emojis.BONK;

    const firstGamerWord = matchedGamerWords[0];
    message.reply(
      `${
        firstGamerWord.response ?? GamerWordDefaultResponse
      }. Nu krediteras du för ${totalCost} poäng.`
    );

    const wallets = LoadBonkDebtWallets();
    const userWallet = wallets.find((wallet) => wallet.userId === user.id);

    if (userWallet) {
      userWallet.balance += totalCost;
      userWallet.lastUpdated = Date.now();

      const index = wallets.findIndex((wallet) => wallet.userId === user.id);
      wallets[index] = userWallet;
    } else {
      wallets.push({
        userId: user.id,
        balance: totalCost,
        lastUpdated: Date.now(),
      });
    }

    SaveBonkDebt(wallets);

    //message.react(emoji);
  }
};
