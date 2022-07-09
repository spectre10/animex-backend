import { Telegraf, Telegram } from "telegraf";
import dotenv from "dotenv";
const result = dotenv.config();

if (result.error) {
  throw result.error;
}
const telegram = new Telegram(process.env.BOT_TOKEN, {
  agent: null,
  webhookReply: true,
});

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use((ctx) => {
  telegram.sendMessage(ctx.from.id, `Your Telegram id: ${ctx.from.id}`);
});
bot.startPolling();

export default telegram;