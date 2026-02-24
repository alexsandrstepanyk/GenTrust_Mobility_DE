import { Scenes, Markup } from "telegraf";
import { BotContext } from "../middleware/auth";
import { analyzeImage } from "../services/gemini";
import prisma from "../services/prisma";
import axios from "axios";
import { awardDignity } from "../services/reputation";
import { cityHallBot } from "../city_hall_bot";
import { mainMenu } from "../keyboards";

export const urbanGuardianScene = new Scenes.WizardScene<BotContext>(
    "urban_guardian",
    // Step 1: Ask for Photo
    async (ctx) => {
        await ctx.reply("📸 Надішли фото проблеми інфраструктури (яма, сміття, поламаний ліхтар тощо).");
        return ctx.wizard.next();
    },
    // Step 2: Receive Photo (or Text Override)
    async (ctx) => {
        // @ts-ignore
        const message = ctx.message;
        if (!message) return; // Should not happen in wizard

        let buffer: Buffer;
        let description: string | undefined = undefined;

        // Type guards
        // @ts-ignore
        const hasPhoto = message.photo && message.photo.length > 0;
        // @ts-ignore
        const hasText = message.text && message.text.length > 0;

        if (hasPhoto) {
            // New Photo Flow
            // @ts-ignore
            const photo = message.photo.pop();
            try {
                const fileLink = await ctx.telegram.getFileLink(photo.file_id);
                const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
                buffer = Buffer.from(response.data, "binary");

                // Cache in session
                // @ts-ignore
                if (!ctx.session.reportData) ctx.session.reportData = {};
                // @ts-ignore
                ctx.session.reportData.photoId = photo.file_id;
                // @ts-ignore
                ctx.session.reportData.lastImageBase64 = buffer.toString("base64");

            } catch (e) {
                console.error(e);
                await ctx.reply("❌ Помилка завантаження фото.");
                return;
            }

            // --- GEMINI ANALYSIS START ---
            await ctx.reply("🔍 Аналізую...");

            try {
                const analysis = await analyzeImage(buffer);
                console.log("Analysis:", analysis);

                if (analysis.is_issue) {
                    // Success
                    // @ts-ignore
                    ctx.session.reportData.aiVerdict = JSON.stringify(analysis);
                    // @ts-ignore
                    ctx.session.reportData.category = analysis.category; // Gemini suggested category

                    await ctx.reply(`✅ Виявлено проблему: ${analysis.category} (Впевненість: ${(analysis.confidence * 100).toFixed(1)}%)\n\nТи можеш підтвердити категорію або вибрати іншу:`,
                        Markup.inlineKeyboard([
                            [Markup.button.callback("🛣️ Дороги", "cat_Roads"), Markup.button.callback("💡 Освітлення", "cat_Lighting")],
                            [Markup.button.callback("🗑️ Сміття", "cat_Waste"), Markup.button.callback("🌳 Парки", "cat_Parks")],
                            [Markup.button.callback("🎨 Вандалізм", "cat_Vandalism"), Markup.button.callback("🚰 Вода", "cat_Water")],
                            [Markup.button.callback("🚗 Авто", "cat_Vehicles"), Markup.button.callback("❓ Інше", "cat_Other")]
                        ])
                    );
                    return ctx.wizard.next();
                } else {
                    // Failure / Unsure
                    await ctx.reply(`🤔 Gemini не впевнений (${analysis.category}).\n\nВиберіть категорію вручну:`,
                        Markup.inlineKeyboard([
                            [Markup.button.callback("🛣️ Дороги", "cat_Roads"), Markup.button.callback("💡 Освітлення", "cat_Lighting")],
                            [Markup.button.callback("🗑️ Сміття", "cat_Waste"), Markup.button.callback("🌳 Парки", "cat_Parks")],
                            [Markup.button.callback("🎨 Вандалізм", "cat_Vandalism"), Markup.button.callback("🚰 Вода", "cat_Water")],
                            [Markup.button.callback("🚗 Авто", "cat_Vehicles"), Markup.button.callback("❓ Інше", "cat_Other")]
                        ])
                    );
                    return ctx.wizard.next();
                }

            } catch (e) {
                console.error(e);
                await ctx.reply("❌ Сталася помилка при аналізі.");
                return ctx.scene.leave();
            }
            // --- GEMINI ANALYSIS END ---

        } else if (hasText) {
            // Description Flow (Manual Override)
            // @ts-ignore
            if (ctx.session.reportData?.lastImageBase64) {
                // @ts-ignore
                const userDescription = message.text;
                // @ts-ignore
                ctx.session.reportData.description = userDescription;
                // Override Verdict
                // @ts-ignore
                ctx.session.reportData.aiVerdict = JSON.stringify({ is_issue: true, confidence: 1, category: "manual_override" });

                await ctx.reply(`✍️ Опис прийнято. Виберіть категорію проблеми:`,
                    Markup.inlineKeyboard([
                        [Markup.button.callback("🛣️ Дороги", "cat_Roads"), Markup.button.callback("💡 Освітлення", "cat_Lighting")],
                        [Markup.button.callback("🗑️ Сміття", "cat_Waste"), Markup.button.callback("🌳 Парки", "cat_Parks")],
                        [Markup.button.callback("🎨 Вандалізм", "cat_Vandalism"), Markup.button.callback("🚰 Вода", "cat_Water")],
                        [Markup.button.callback("🚗 Авто", "cat_Vehicles"), Markup.button.callback("❓ Інше", "cat_Other")]
                    ])
                );
                return ctx.wizard.next();
            } else {
                await ctx.reply("📸 Спочатку надішли фото.");
                return;
            }
        } else {
            await ctx.reply("Будь ласка, надішли фото або текст.");
            return;
        }
    },
    // Step 3: Handle Category Selection
    async (ctx) => {
        // @ts-ignore
        const callbackData = ctx.callbackQuery?.data;
        if (!callbackData || !callbackData.startsWith("cat_")) {
            await ctx.reply("Будь ласка, виберіть категорію, натиснувши на кнопку.");
            return;
        }

        const category = callbackData.replace("cat_", "");
        // @ts-ignore
        ctx.session.reportData.category = category;

        await ctx.answerCbQuery(`Вибрано: ${category}`);
        await ctx.reply(`📍 Прийнято: ${category}.\n\nТепер надішли свою геолокацію (скріпка -> Location).`);
        return ctx.wizard.next();
    },
    // Step 4: Location (Reached after Category Selection)
    async (ctx) => {
        // @ts-ignore
        if (!ctx.message?.location) {
            await ctx.reply("Будь ласка, надішли геолокацію (скріпку -> Location).");
            return;
        }

        // @ts-ignore
        const location = ctx.message.location;

        // Save report
        if (ctx.user && ctx.session.reportData) {
            const report = await prisma.report.create({
                data: {
                    authorId: ctx.user.id,
                    photoId: ctx.session.reportData.photoId,
                    aiVerdict: ctx.session.reportData.aiVerdict,
                    category: ctx.session.reportData.category,
                    // @ts-ignore
                    description: ctx.session.reportData.description || null,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    status: "PENDING"
                }
            });

            // Update user's updatedAt to pull them to the top of the admin's 'Recent' list
            await prisma.user.update({
                where: { id: ctx.user.id },
                data: { updatedAt: new Date() }
            });

            await awardDignity(ctx.user.id, 2);

            // User UX Reply
            let nextSteps = "";
            let keyboard = undefined;

            if (ctx.session.activeQuest) {
                // Redirect user to Maps for their delivery
                // Just mock link to Würzburg center or user's last known loc
                nextSteps = "🎒 Продовжуємо доставку! Повертайся до маршруту.";
                // Could verify against delivery address but for MVP generic
                keyboard = Markup.inlineKeyboard([
                    Markup.button.url("🗺️ До Маршруту (Google Maps)", "https://www.google.com/maps"),
                    Markup.button.callback("📜 Меню Квестів", "exit_to_menu") // Should be handled or just text
                ]);
            } else {
                nextSteps = "Ти вільний! Гарного дня і дякуємо за допомогу місту! 🏙️";
                keyboard = mainMenu;
            }

            await ctx.reply(`✅ Дякуємо! Твій звіт прийнято.\n\nЯкщо Мерія підтвердить проблему, твій рейтинг буде подвоєно (+5 балів)!\n\n${nextSteps}`, keyboard);

            // SEND TO CITY HALL BOT
            if (cityHallBot) {
                const adminChatId = process.env.ADMIN_CHAT_ID;
                if (adminChatId && adminChatId !== "0") {
                    const isLowPriority = ctx.user?.urbanBanExpiresAt && new Date(ctx.user.urbanBanExpiresAt) > new Date();
                    const priorityZone = isLowPriority ? "🔴 КАТЕГОРІЯ Б (Нижчий пріоритет - були помилки)" : "🟢 КАТЕГОРІЯ А (Високий пріоритет)";

                    const categoryEmojiMap: Record<string, string> = {
                        "Roads": "🛣️", "Lighting": "💡", "Waste": "🗑️", "Parks": "🌳",
                        "Vandalism": "🎨", "Water": "🚰", "Vehicles": "🚗", "Other": "❓"
                    };
                    const emoji = categoryEmojiMap[report.category || ""] || "📋";

                    const caption = `🏛️ НОВИЙ ЗВІТ (ID: ${report.id.slice(0, 4)})\n\n${priorityZone}\n\n👤 Автор ID: ${ctx.user?.id.slice(0, 8)}\n📂 Категорія: ${emoji} ${report.category}\n📝 Опис: ${report.description || "Без опису"}\n📍 Локація: ${location.latitude}, ${location.longitude}`;

                    // Convert base64 back to buffer for City Hall Bot (different bots can't share file IDs)
                    const imageBuffer = Buffer.from(ctx.session.reportData.lastImageBase64 || "", "base64");

                    await cityHallBot.telegram.sendPhoto(adminChatId, { source: imageBuffer }, {
                        caption: caption,
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback("✅ Підтвердити (Правда)", `approve_report_${report.id}`), Markup.button.callback("❌ Фейк (Брехня)", `reject_report_${report.id}`)],
                            [Markup.button.callback("👤 Керувати автором звіту", `manage_user_${report.authorId}`)]
                        ])
                    });
                } else {
                    console.log("Admin Chat ID not set. Report saved but not sent to City Hall.");
                }
            }
        }

        return ctx.scene.leave();
    }
);
