import { Composer, InlineKeyboard } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { privateKeyToAccount } from 'thirdweb/wallets'
import { createThirdwebClient } from 'thirdweb'
import { config } from 'dotenv' 
config()

const composer = new Composer<Context>()

const feature = composer.chatType('private')

const adminAccount = privateKeyToAccount({
  privateKey: process.env.ADMIN_SECRET_KEY as string,
  client: createThirdwebClient({ clientId: process.env.THIRDWEB_CLIENT_ID as string }),
})

// Function to get user's wallet address
async function getUserWalletAddress(userId: string): Promise<string | null> {
  // Implementation depends on how you store/retrieve user wallet addresses
  // This is a placeholder function
  return null; // Return null if not found
}

feature.command('start', async (ctx) => {
  const username = ctx.from?.username || 'Unknown User';
  const userId = ctx.from?.id.toString();
  const expiration = Date.now() + 600_000; // valid for 10 minutes
  const message = JSON.stringify({
    username,
    expiration,
  });
  const authCode = await adminAccount.signMessage({
    message,
  });

  // Fetch the admin account's wallet address
  const adminWalletAddress = await adminAccount.address;

  // Fetch the user's wallet address
  const userWalletAddress = await getUserWalletAddress(userId);

  const keyboard = new InlineKeyboard().webApp('Launch App', `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?signature=${authCode}&message=${encodeURI(message)}`);
  
  // Prepare the response message
  let responseMessage = `
Welcome to the bot, @${username}!

Your Information:
- Username: @${username}
`;

  if (userWalletAddress) {
    responseMessage += `- Your Wallet Address: ${userWalletAddress}\n`;
  } else {
    responseMessage += "- Your wallet address is not registered.\n";
  }

  responseMessage += `
Admin Information:
- Admin Wallet Address: ${adminWalletAddress}

Pick an app to launch.`;

  return ctx.reply(responseMessage.trim(), { reply_markup: keyboard })
})

export { composer as startFeature }