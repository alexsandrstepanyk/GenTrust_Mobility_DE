import { Telegraf } from "telegraf";

/**
 * MessengerHub centralizes communication across multiple Telegram bot instances.
 * This allows one bot (e.g., Master Bot) to send notifications through another bot (e.g., Scout Bot)
 * to ensure users receive messages from the bot they are actually interacting with.
 */
class MessengerHub {
    private bots: Record<string, Telegraf<any>> = {};
    private pending: Record<string, Array<{ telegramId: number | bigint; message: string; options: any }>> = {};

    /**
     * Register a bot instance with a friendly name.
     */
    registerBot(name: string, bot: Telegraf<any>) {
        this.bots[name] = bot;
        console.log(`[MessengerHub] Registered bot: ${name}`);
        this.flushPending(name).catch(err => {
            console.error(`[MessengerHub] Failed to flush pending messages for ${name}:`, err);
        });
    }

    /**
     * Send a message to a Scout (User) via the Scout Bot.
     */
    async sendToScout(telegramId: number | bigint, message: string, options: any = {}) {
        return this.sendMessage("scout", telegramId, message, options);
    }

    /**
     * Send a message to a Provider via the Quest Provider Bot.
     */
    async sendToProvider(telegramId: number | bigint, message: string, options: any = {}) {
        return this.sendMessage("provider", telegramId, message, options);
    }

    /**
     * Send a message to an Admin via the City Hall Bot.
     */
    async sendToAdmin(telegramId: number | bigint, message: string, options: any = {}) {
        return this.sendMessage("cityhall", telegramId, message, options);
    }

    /**
     * Send a message to the Master Admin via the Master Bot.
     */
    async sendToMaster(telegramId: number | bigint, message: string, options: any = {}) {
        return this.sendMessage("master", telegramId, message, options);
    }

    /**
     * Send a message to a Municipal Worker via the Municipal Bot.
     */
    async sendToMunicipal(telegramId: number | bigint, message: string, options: any = {}) {
        return this.sendMessage("municipal", telegramId, message, options);
    }

    /**
     * General purpose message sender.
     */
    private async sendMessage(botName: string, telegramId: number | bigint, message: string, options: any = {}) {
        const bot = this.bots[botName];
        if (!bot) {
            console.warn(`[MessengerHub] Bot '${botName}' not registered. Message to ${telegramId} dropped.`);
            if (!this.pending[botName]) this.pending[botName] = [];
            this.pending[botName].push({ telegramId, message, options });
            return false;
        }

        try {
            await bot.telegram.sendMessage(Number(telegramId), message, {
                parse_mode: "Markdown",
                ...options
            });
            return true;
        } catch (error) {
            console.error(`[MessengerHub] Failed to send message via ${botName} to ${telegramId}:`, error);
            return false;
        }
    }

    private async flushPending(botName: string) {
        const bot = this.bots[botName];
        const queue = this.pending[botName];
        if (!bot || !queue || queue.length === 0) return;

        const pendingItems = [...queue];
        this.pending[botName] = [];

        for (const item of pendingItems) {
            try {
                await bot.telegram.sendMessage(Number(item.telegramId), item.message, {
                    parse_mode: "Markdown",
                    ...item.options
                });
            } catch (error) {
                console.error(`[MessengerHub] Failed to send pending message via ${botName} to ${item.telegramId}:`, error);
            }
        }
    }
}

export const messengerHub = new MessengerHub();
