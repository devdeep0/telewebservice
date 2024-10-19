import { Composer, InlineKeyboard, Context as GrammyContext } from 'grammy'
import { privateKeyToAccount } from 'thirdweb/wallets'
import { createThirdwebClient } from 'thirdweb'
import { config } from 'dotenv'
config()

// Define custom session type
interface SessionData {
  welcomed: boolean;
}

// Extend the Context type to include our custom session
interface MyContext extends GrammyContext {
  session: SessionData;
}

const composer = new Composer<MyContext>()

const feature = composer.chatType('private')

const adminAccount = privateKeyToAccount({
  privateKey: process.env.ADMIN_SECRET_KEY as string,
  client: createThirdwebClient({ clientId: process.env.THIRDWEB_CLIENT_ID as string }),
})

// Function to generate auth code and keyboard
async function generateAuthCodeAndKeyboard(username: string | undefined) {
  const expiration = Date.now() + 600_000; // valid for 10 minutes
  const message = JSON.stringify({
    username,
    expiration,
  });
  const authCode = await adminAccount.signMessage({
    message,
  });
  
  return new InlineKeyboard().webApp('Play 🎮', `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?signature=${authCode}&message=${encodeURI(message)}`);
}

// Initial message when bot is started
feature.use(async (ctx, next) => {
  if (ctx.chat?.type === 'private' && !ctx.session.welcomed) {
    await ctx.replyWithPhoto('https://rupturelabs.vercel.app/_next/image?url=%2Flogo%2FBlackRL.png&w=96&q=75', {
      caption: '👋 Welcome to our gaming bot! Use /start to begin your gaming adventure!',
    });
    ctx.session.welcomed = true;
  }
  await next();
});

// Existing /start command
feature.command('start', async (ctx) => {
  const keyboard = await generateAuthCodeAndKeyboard(ctx.from?.username);
  return ctx.reply('🎮 Discover Your Next Favorite Game & start playing 👇', { reply_markup: keyboard });
});

export { composer as startFeature }

// Export the SessionData type for use in the main bot file
export type { SessionData }