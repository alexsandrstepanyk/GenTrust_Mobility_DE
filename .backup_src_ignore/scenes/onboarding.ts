import { Scenes, Markup } from "telegraf";
import { BotContext } from "../middleware/auth";
import prisma from "../services/prisma";
import { mainMenu } from "../keyboards";

export const onboardingScene = new Scenes.WizardScene<BotContext>(
    "onboarding",
    // Step 1: City
    async (ctx) => {
        await ctx.reply("👋 Привіт, майбутній Скаут! Давай зареєструємо тебе.\n\nВ якому місті ти проживаєш? (напр. Würzburg, Kyiv)");
        ctx.session.onboarding = {}; // Init session
        return ctx.wizard.next();
    },
    // Step 2: District
    async (ctx) => {
        // @ts-ignore
        const city = ctx.message?.text;
        if (!city) return ctx.reply("Будь ласка, введи назву міста текстом.");
        if (ctx.session.onboarding) ctx.session.onboarding.city = city;

        await ctx.reply("📍 А в якому районі? (напр. Zellerau, Altstadt)");
        return ctx.wizard.next();
    },
    // Step 3: First Name
    async (ctx) => {
        // @ts-ignore
        const district = ctx.message?.text;
        if (!district) return ctx.reply("Будь ласка, введи назву району текстом.");
        if (ctx.session.onboarding) ctx.session.onboarding.district = district;

        await ctx.reply("✍️ Як тебе звати? (Ім'я)");
        return ctx.wizard.next();
    },
    // Step 3: Last Name
    async (ctx) => {
        // @ts-ignore
        const firstName = ctx.message?.text;
        if (!firstName) return ctx.reply("Введи ім'я текстом.");

        if (ctx.session.onboarding) ctx.session.onboarding.firstName = firstName;

        await ctx.reply("✍️ Твоє прізвище?");
        return ctx.wizard.next();
    },
    // Step 4: Birth Date
    async (ctx) => {
        // @ts-ignore
        const lastName = ctx.message?.text;
        if (!lastName) return ctx.reply("Введи прізвище текстом.");

        if (ctx.session.onboarding) ctx.session.onboarding.lastName = lastName;

        await ctx.reply("📅 Дата народження? (формат: ДД.ММ.РРРР, напр. 12.05.2010)");
        return ctx.wizard.next();
    },
    // Step 5: School
    async (ctx) => {
        // @ts-ignore
        const birthDate = ctx.message?.text;
        // Simple validation could go here
        if (!birthDate) return ctx.reply("Введи дату текстом.");

        if (ctx.session.onboarding) ctx.session.onboarding.birthDate = birthDate;

        await ctx.reply("🏫 В якій школі ти навчаєшся?");
        return ctx.wizard.next();
    },
    // Step 6: Grade
    async (ctx) => {
        // @ts-ignore
        const school = ctx.message?.text;
        if (!school) return ctx.reply("Введи назву школи.");

        if (ctx.session.onboarding) ctx.session.onboarding.school = school;

        await ctx.reply("🎓 В якому ти класі? (напр. 7-A)");
        return ctx.wizard.next();
    },
    // Step 7: Final Confirmation and Code of Conduct
    async (ctx) => {
        // @ts-ignore
        const grade = ctx.message?.text;
        if (!grade) return ctx.reply("Введи клас.");

        if (ctx.session.onboarding) ctx.session.onboarding.grade = grade;

        const data = ctx.session.onboarding;

        await ctx.reply(
            `🔍 Перевір дані:
      
👥 ${data?.firstName} ${data?.lastName}
📅 ${data?.birthDate}
🏫 ${data?.school}, Клас ${data?.grade}
📍 Місто: ${data?.city}
🏠 Район: ${data?.district}

📜 Кодекс Скаута:
1. Я обіцяю бути чесним.
2. Я дбаю про своє місто.
3. Я допомагаю іншим.

Ти погоджуєшся і дані вірні?`,
            Markup.inlineKeyboard([
                Markup.button.callback("✅ Так, реєструюся", "agree_code"),
                Markup.button.callback("❌ Ні, почати знову", "restart_onboarding")
            ])
        );
        return ctx.wizard.next();
    },
    // Step 8: Save to DB
    async (ctx) => {
        // @ts-ignore
        const callbackData = ctx.callbackQuery?.data;

        if (callbackData === "restart_onboarding") {
            await ctx.answerCbQuery("Починаємо спочатку...");
            ctx.scene.enter("onboarding"); // Re-enter
            return;
        }

        if (callbackData === "agree_code") {
            await ctx.answerCbQuery();

            const data = ctx.session.onboarding;

            // Update user
            if (ctx.user && data) {
                const updatedUser = await prisma.user.update({
                    where: { id: ctx.user.id },
                    data: {
                        city: data.city,
                        district: data.district,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        birthDate: data.birthDate,
                        school: data.school,
                        grade: data.grade,
                        status: "PENDING"
                    }
                });

                // Update context user
                ctx.user = updatedUser;

                // Send to Master Bot (System Core)
                const masterBotToken = process.env.CITY_HALL_BOT_TOKEN;
                // @ts-ignore
                const { Telegraf } = await import("telegraf");
                const masterBot = new Telegraf(masterBotToken || "");
                const adminChatId = process.env.ADMIN_CHAT_ID;
                if (adminChatId) {
                    const adminMsg = `🆕 **Нова заявка СКАУТА!**\n\n👤 ${updatedUser.firstName} ${updatedUser.lastName}\n🏙️ ${updatedUser.city} | 🏫 ${updatedUser.school}\n👤 ID: ${updatedUser.id}\n\nОберіть дію у Master Bot:`;
                    await masterBot.telegram.sendMessage(adminChatId, adminMsg, {
                        parse_mode: "Markdown",
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback("✅ Схвалити", `approve_user_${updatedUser.id}`)],
                            [Markup.button.callback("❌ Відхилити", `reject_user_${updatedUser.id}`)]
                        ])
                    });
                }
            }

            await ctx.reply("🚀 Твою анкету надіслано на модерацію до **System Core**. \n\nЯк тільки її схвалять, ти отримаєш сповіщення і зможеш почати свою першу місію!");
            return ctx.scene.leave();
        } else {
            // If user typed something instead of clicking button
            await ctx.reply("Будь ласка, натисни кнопку.");
            return;
        }
    }
);
