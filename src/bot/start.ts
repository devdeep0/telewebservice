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

// Array of random messages
const randomMessages = [
  "🎮 Ready for your next gaming adventure?",
  "🌟 Discover amazing games waiting for you!",
  "🎯 Level up your gaming experience now!",
  "🎲 Time for some gaming fun!",
  "🏆 New challenges await you!",
  "🚀 Ready to jump back into action?",
  "🎪 Your gaming journey continues here!",
  "⭐ Find your next favorite game!",
  "🎭 Endless gaming possibilities await!",
  "🎨 Dive into new gaming worlds!"
];

// Function to get a random message
const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * randomMessages.length);
  return randomMessages[randomIndex];
};

// Function to create the signed message
const createSignedMessage = async (username: string | undefined) => {
  const message = JSON.stringify({
    username,
    // Remove expiration for unlimited session
  });
  
  const authCode = await adminAccount.signMessage({
    message,
  });

  return { message, authCode };
};

// Function to create keyboard
const createGameKeyboard = (authCode: string, message: string) => {
  return new InlineKeyboard().webApp(
    'Play 🎮', 
    `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?signature=${authCode}&message=${encodeURI(message)}`
  );
};

feature.command('start', async (ctx) => {
  const username = ctx.from?.username;
  const { message, authCode } = await createSignedMessage(username);
  const keyboard = createGameKeyboard(authCode, message);
  
  // Send initial message
  await ctx.reply('🎮 Discover Your Next Favorite Game & start playing 👇', { 
    reply_markup: keyboard 
  });

  // Start periodic messages
  setInterval(async () => {
    try {
      const { message: newMessage, authCode: newAuthCode } = await createSignedMessage(username);
      const newKeyboard = createGameKeyboard(newAuthCode, newMessage);
      
      await ctx.reply(getRandomMessage(), {
        reply_markup: newKeyboard
      });
    } catch (error) {
      console.error('Error sending periodic message:', error);
    }
  }, 100000); // 10 minutes in milliseconds
});

export { composer as startFeature }