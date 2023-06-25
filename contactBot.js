import { Telegraf, Telegram } from "telegraf";
import dotenv from "dotenv";
const result = dotenv.config();

if (result.error) {
  throw result.error;
}

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use((ctx) => {
  telegram.sendMessage(ctx.from.id, `Your Telegram id: ${ctx.from.id}`);
});
bot.launch();

export default bot;
