import { EmojiResolvable, Message } from "discord.js";
import GamerWord from "../modules/gamerWord/gamerWord";
import { GamerWordDefaultResponse } from "../constants/defaults";
import emojis from "../constants/emojis";
import listAndBuildGamerWords from "../modules/gamerWord/list";
import getUserWallet from "../modules/debtWallet/get";
import updateUserWallet from "../modules/debtWallet/update";
import createWallet from "../modules/debtWallet/create";

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

    try {
      const userWallet = await getUserWallet(user.id);

      await updateUserWallet(user.id, userWallet.balance + totalCost);
    } catch (err: any) {
      if (err.message && err.message === "Wallet not found") {
        console.log("Wallet not found, creating new wallet.");

        await createWallet(user.id);
        await updateUserWallet(user.id, totalCost);
      } else {
        throw err;
      }
    }

    //message.react(emoji);
  }
};
