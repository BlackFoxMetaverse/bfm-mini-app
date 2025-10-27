import { Telegraf } from "telegraf";
import { Agent as HttpsAgent } from "https";

// ✅ Replace with your new token
const bot = new Telegraf(
  "8297710276:AAHp4WlRjQESzR3C_oF86XUPGV2NW_C6_FE"
) as any;

// Force IPv4 polling to avoid MacOS/VPN hanging issue
bot.telegram.options.agent = new HttpsAgent({ family: 4 });

export default bot;
