import express from 'express';
import { Bot, Context as DefaultContext, webhookCallback } from 'grammy';
import { Logger } from './logger.js';

interface ServerConfig<C extends DefaultContext = DefaultContext> {
  bot: Bot<C>;
  logger: Logger;
  port: number;
  webhookPath?: string;
}

export function createServer<C extends DefaultContext = DefaultContext>({ 
  bot, 
  logger, 
  port, 
  webhookPath 
}: ServerConfig<C>) {
  const app = express();

  // Parse the body
  app.use(express.json());

  if (webhookPath) {
    // Webhook mode
    app.use(webhookPath, webhookCallback(bot, 'express'));
    logger.info(`Webhook endpoint set up at ${webhookPath}`);
  } else {
    // Polling mode
    app.get('/', (req, res) => {
      res.send('Bot is running in polling mode');
    });
  }

  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      resolve();
    });
  })
}