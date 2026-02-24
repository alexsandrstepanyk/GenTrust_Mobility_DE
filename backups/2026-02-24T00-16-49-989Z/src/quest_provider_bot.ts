import { Telegraf, Scenes, session, Markup, Context } from "telegraf";
import dotenv from "dotenv";
import prisma from "./services/prisma";

dotenv.config();

const token = process.env.QUEST_PROVIDER_BOT_TOKEN;
if (!token) {
    console.warn("QUEST_PROVIDER_BOT_TOKEN not set. Quest Provider Bot disabled.");
}

export interface MyProviderSessionData {
    onboarding?: {
        name?: string;
        type?: string;
        city?: string;
    };
    providerData?: {
        title?: string;
        description?: string;
        reward?: number;
        city?: string;
        district?: string;
        type?: string;
    };
    verifyingQuestId?: string;
}

export interface ProviderSession extends Scenes.WizardSession<Scenes.WizardSessionData>, MyProviderSessionData { }

export interface ProviderContext extends Scenes.WizardContext<Scenes.WizardSessionData> {
    session: ProviderSession;
    provider?: any;
}

// 1. АВТОРІЗАЦІЯ ПРОВАЙДЕРА
const authProvider = async (ctx: any, next: any) => {
    const tid = ctx.from?.id;
    if (!tid) return;

    let provider = await (prisma as any).provider.findUnique({
        where: { telegramId: BigInt(tid) }
    });

    ctx.provider = provider;
    return next();
};

// 2. СЦЕНА РЕЄСТРАЦІЇ ПРОВАЙДЕРА
const providerOnboarding = new Scenes.WizardScene<ProviderContext>(
    "provider_onboarding",
    async (ctx) => {
        await ctx.reply("👋 Вітаємо в GenTrust! Щоб почати замовляти доставки, заповніть, будь ласка, коротку анкету.\n\nЯк називається ваша компанія/магазин?");
        ctx.session.onboarding = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.onboarding) ctx.session.onboarding.name = (ctx.message as any)?.text;
        await ctx.reply("🏢 Оберіть тип вашого бізнесу (напр. Аптека, Ресторан, Школа):");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.onboarding) ctx.session.onboarding.type = (ctx.message as any)?.text;
        await ctx.reply("🏙️ В якому місті ви працюєте?");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.onboarding) ctx.session.onboarding.city = (ctx.message as any)?.text;
        const d = ctx.session.onboarding;

        // Create provider in PENDING status
        const provider = await (prisma as any).provider.create({
            data: {
                telegramId: BigInt(ctx.from?.id || 0),
                name: d?.name || "Новий Бізнес",
                type: d?.type || "BUSINESS",
                city: d?.city,
                status: "PENDING"
            }
        });
        ctx.provider = provider;

        // Send to Master Bot (System Core)
        const masterBotToken = process.env.CITY_HALL_BOT_TOKEN; // Master Core
        const masterBot = new Telegraf(masterBotToken || "");

        const adminChatId = process.env.ADMIN_CHAT_ID;
        if (adminChatId) {
            const adminMsg = `🆕 **Нова заявка ПРОВАЙДЕРА!**\n\n🏢 Назва: ${d?.name}\n🛠️ Тип: ${d?.type}\n🏙️ Місто: ${d?.city}\n👤 Юзер: @${ctx.from?.username || ctx.from?.id}\n\nОберіть дію у Master Bot:`;
            await masterBot.telegram.sendMessage(adminChatId, adminMsg, {
                parse_mode: "Markdown",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("✅ Схвалити", `approve_provider_${provider.id}`)],
                    [Markup.button.callback("❌ Відхилити", `reject_provider_${provider.id}`)]
                ])
            });
        }

        await ctx.reply("✅ Дякуємо! Ваша заявка надіслана на модерацію в **System Core**. Ми сповістимо вас, як тільки її перевірять.");
        return ctx.scene.leave();
    }
);


// 2. СЦЕНА ВЕРИФІКАЦІЇ ВИДАЧІ
const pickupVerification = new Scenes.WizardScene<ProviderContext>(
    "pickup_verification",
    async (ctx) => {
        await ctx.reply("🤝 **Передача замовлення кур'єру**\n\nБудь ласка, введіть 4-значний КОД ВИДАЧІ, який вам назвав скаут:", {
            parse_mode: "Markdown",
            ...Markup.keyboard([["❌ Скасувати"]]).resize()
        });
        return ctx.wizard.next();
    },
    async (ctx) => {
        const code = (ctx.message as any)?.text;
        if (code === "❌ Скасувати") {
            await ctx.reply("Скасовано.");
            return ctx.scene.leave();
        }

        if (!/^\d{4}$/.test(code)) {
            return ctx.reply("❌ Будь ласка, введіть рівно 4 цифри або натисніть 'Скасувати'.");
        }

        const quest = await (prisma as any).quest.findFirst({
            where: {
                providerId: ctx.provider?.id,
                pickupCode: code,
                status: "IN_PROGRESS"
            },
            include: { assignee: true }
        });

        if (!quest) {
            return ctx.reply("❌ Замовлення з таким кодом не знайдено (або воно вже видане/не активоване). Спробуйте ще раз або перевірте код.");
        }

        ctx.session.verifyingQuestId = quest.id;

        await ctx.reply(`🔍 **Знайдено замовлення!**

📌 Назва: ${quest.title}
💰 Винагорода: ${quest.reward}€
👤 Кур'єр: ${quest.assignee?.firstName || quest.assignee?.username || "Невідомо"}

Ви підтверджуєте передачу товару цьому кур'єру?`, Markup.inlineKeyboard([
            [Markup.button.callback("✅ Так, передав товар", "confirm_handover")],
            [Markup.button.callback("❌ Ні, помилка", "cancel_handover")]
        ]));
        return ctx.wizard.next();
    },
    async (ctx) => {
        const cb = (ctx.callbackQuery as any)?.data;
        const qid = ctx.session.verifyingQuestId;

        if (cb === "confirm_handover") {
            await (prisma as any).quest.update({
                where: { id: qid },
                data: { pickupCode: "PICKED__UP" }
            });
            await ctx.reply("✅ Готoво! Видачу підтверджено. Тепер скаут має доставити товар клієнту.");
            await ctx.answerCbQuery();
        } else {
            await ctx.reply("❌ Видачу скасовано.");
        }
        return ctx.scene.leave();
    }
);

// 3. СЦЕНА СТВОРЕННЯ КВЕСТУ
const questConstructor = new Scenes.WizardScene<ProviderContext>(
    "quest_constructor",
    async (ctx) => {
        await ctx.reply("📂 Оберіть тип завдання:", Markup.inlineKeyboard([
            [Markup.button.callback("📦 Доставка", "type_LOGISTICS")],
            [Markup.button.callback("🛠️ Робота/Допомога", "type_WORK")],
            [Markup.button.callback("🌟 Волонтерство", "type_VOLUNTEER")]
        ]));
        ctx.session.providerData = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        const cb = (ctx.callbackQuery as any)?.data;
        if (!cb || !cb.startsWith("type_")) return ctx.reply("Будь ласка, оберіть тип зі списку.");

        if (ctx.session.providerData) ctx.session.providerData.type = cb.replace("type_", "");
        await ctx.answerCbQuery();
        await ctx.reply("📝 Введіть назву завдання (напр. Доставка піци, Прибирання листя):");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.providerData) ctx.session.providerData.title = (ctx.message as any)?.text;
        await ctx.reply("📄 Опишіть детально умови та що саме потрібно зробити:");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.providerData) ctx.session.providerData.description = (ctx.message as any)?.text;
        await ctx.reply("💰 Яка винагорода (бали/євро)? Введіть тільки число:");
        return ctx.wizard.next();
    },
    async (ctx) => {
        const reward = parseFloat((ctx.message as any)?.text);
        if (isNaN(reward)) return ctx.reply("Будь ласка, введіть число.");
        if (ctx.session.providerData) ctx.session.providerData.reward = reward;

        await ctx.reply("🏙️ В якому місті це потрібно зробити? (напр. Würzburg, Київ)");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.providerData) ctx.session.providerData.city = (ctx.message as any)?.text;
        await ctx.reply("🏠 Введіть район або конкретну адресу:");
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.providerData) ctx.session.providerData.district = (ctx.message as any)?.text;

        const d = ctx.session.providerData;
        await ctx.reply(`🔍 **ПЕРЕВІРКА ЗАВДАННЯ**

🗂️ Тип: ${d?.type}
📌 Назва: ${d?.title}
📝 Опис: ${d?.description}
💰 Винагорода: ${d?.reward}
📍 Локація: ${d?.city}, ${d?.district}

Опублікувати завдання?`, Markup.inlineKeyboard([
            [Markup.button.callback("🚀 Так, опублікувати", "publish_quest")],
            [Markup.button.callback("❌ Скасувати", "cancel_quest")]
        ]));
        return ctx.wizard.next();
    },
    async (ctx) => {
        const cb = (ctx.callbackQuery as any)?.data;
        if (cb === "publish_quest") {
            const d = ctx.session.providerData;
            await (prisma as any).quest.create({
                data: {
                    title: d?.title,
                    description: d?.description,
                    reward: d?.reward,
                    city: d?.city,
                    district: d?.district,
                    type: d?.type || "WORK",
                    status: "OPEN",
                    providerId: ctx.provider?.id
                }
            });
            await ctx.reply("✅ Завдання успішно додано! Скаути у вашому місті отримають сповіщення.");
        } else {
            await ctx.reply("❌ Створення скасовано.");
        }
        return ctx.scene.leave();
    }
);

// 5. БОТ ПРОВАЙДЕРА
export const questProviderBot = token ? new Telegraf<ProviderContext>(token) : null;

if (questProviderBot) {
    const stage = new Scenes.Stage<ProviderContext>([providerOnboarding, questConstructor, pickupVerification]);
    questProviderBot.use(session());
    questProviderBot.use(authProvider);
    questProviderBot.use(stage.middleware());

    questProviderBot.start(async (ctx) => {
        if (!ctx.provider) {
            return ctx.scene.enter("provider_onboarding");
        }

        if (ctx.provider.status === "PENDING") {
            return ctx.reply("⏳ Ваша заявка знаходиться на розгляді у модератора. Ми сповістимо вас, як тільки вона буде схвалена.");
        }

        if (ctx.provider.status === "REJECTED") {
            return ctx.reply("❌ На жаль, вашу заявку на реєстрацію було відхилено. Зв'яжіться з підтримкою для уточнення деталей.");
        }

        ctx.reply(`🏢 **Кабінет Провайдера GenTrust**\n\nВітаємо, ${ctx.provider.name}! Оберіть дію:`, Markup.keyboard([
            ["➕ Додати нове завдання"],
            ["🤝 Видати замовлення кур'єру"],
            ["📋 Мої активні квести", "📊 Статистика"]
        ]).resize());
    });


    questProviderBot.hears("➕ Додати нове завдання", (ctx) => ctx.scene.enter("quest_constructor"));
    questProviderBot.hears("🤝 Видати замовлення кур'єру", (ctx) => ctx.scene.enter("pickup_verification"));

    questProviderBot.hears("📋 Мої активні квести", async (ctx) => {
        const quests = await (prisma as any).quest.findMany({
            where: { providerId: ctx.provider?.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
            orderBy: { createdAt: 'desc' }
        });

        if (quests.length === 0) return ctx.reply("У вас поки немає активних завдань.");

        let msg = "📋 **Ваші активні завдання:**\n\n";
        quests.forEach((q: any) => {
            const icon = q.status === "OPEN" ? "🟢" : "🟡";
            const codeInfo = q.status === "IN_PROGRESS" ? `\n🔑 Очікуваний код: \`${q.pickupCode}\`` : "";
            msg += `${icon} **${q.title || 'Квест'}**\n💰 ${q.reward}€ | 📍 ${q.city}${codeInfo}\n\n`;
        });
        ctx.reply(msg, { parse_mode: "Markdown" });
    });

    questProviderBot.hears("📊 Статистика", async (ctx) => {
        const count = await (prisma as any).quest.count({ where: { providerId: ctx.provider?.id } });
        const completed = await (prisma as any).quest.count({ where: { providerId: ctx.provider?.id, status: "COMPLETED" } });
        ctx.reply(`📊 **Ваша статистика:**\n\nВсього створено: ${count}\nВиконано скаутами: ${completed}\n\nДякуємо, що допомагаєте молоді розвиватися!`, { parse_mode: "Markdown" });
    });

    console.log("[Quest Provider Bot] Initialized.");
}
