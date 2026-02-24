import { Scenes, Markup } from "telegraf";
import { BotContext } from "../middleware/auth";
import prisma from "../services/prisma";
import { mainMenu } from "../keyboards";
import { messengerHub } from "../services/messenger";

export const onboardingScene = new Scenes.WizardScene<BotContext>(
    "onboarding",
    // Step 1: City
    async (ctx) => {
        await ctx.reply("👋 Hallo, zukünftiger Scout! Lass uns dich registrieren.\n\nIn welcher Stadt wohnst du? (z.B. Würzburg, Kyiv)");
        ctx.session.onboarding = {}; // Init session
        return ctx.wizard.next();
    },
    // Step 2: District
    async (ctx) => {
        // @ts-ignore
        const city = ctx.message?.text;
        if (!city) return ctx.reply("Bitte gib den Stadtnamen als Text ein.");
        if (ctx.session.onboarding) ctx.session.onboarding.city = city;

        await ctx.reply("📍 Und in welchem Bezirk? (z.B. Zellerau, Altstadt)");
        return ctx.wizard.next();
    },
    // Step 3: First Name
    async (ctx) => {
        // @ts-ignore
        const district = ctx.message?.text;
        if (!district) return ctx.reply("Bitte gib den Bezirksnamen als Text ein.");
        if (ctx.session.onboarding) ctx.session.onboarding.district = district;

        await ctx.reply("✍️ Wie heißt du? (Vorname)");
        return ctx.wizard.next();
    },
    // Step 3: Last Name
    async (ctx) => {
        // @ts-ignore
        const firstName = ctx.message?.text;
        if (!firstName) return ctx.reply("Gib deinen Vornamen als Text ein.");

        if (ctx.session.onboarding) ctx.session.onboarding.firstName = firstName;

        await ctx.reply("✍️ Dein Nachname?");
        return ctx.wizard.next();
    },
    // Step 4: Birth Date
    async (ctx) => {
        // @ts-ignore
        const lastName = ctx.message?.text;
        if (!lastName) return ctx.reply("Gib deinen Nachnamen als Text ein.");

        if (ctx.session.onboarding) ctx.session.onboarding.lastName = lastName;

        await ctx.reply("📅 Geburtsdatum? (Format: TT.MM.JJJJ, z.B. 12.05.2010)");
        return ctx.wizard.next();
    },
    // Step 5: School
    async (ctx) => {
        // @ts-ignore
        const birthDate = ctx.message?.text;
        // Simple validation could go here
        if (!birthDate) return ctx.reply("Gib das Datum als Text ein.");

        if (ctx.session.onboarding) ctx.session.onboarding.birthDate = birthDate;

        await ctx.reply("🏫 In welche Schule gehst du?");
        return ctx.wizard.next();
    },
    // Step 6: Grade
    async (ctx) => {
        // @ts-ignore
        const school = ctx.message?.text;
        if (!school) return ctx.reply("Gib den Schulnamen ein.");

        if (ctx.session.onboarding) ctx.session.onboarding.school = school;

        await ctx.reply("🎓 In welcher Klasse bist du? (z.B. 7-A)");
        return ctx.wizard.next();
    },
    // Step 7: Final Confirmation and Code of Conduct
    async (ctx) => {
        // @ts-ignore
        const grade = ctx.message?.text;
        if (!grade) return ctx.reply("Gib deine Klasse ein.");

        if (ctx.session.onboarding) ctx.session.onboarding.grade = grade;

        const data = ctx.session.onboarding;

        await ctx.reply(
            `🔍 Prüfe deine Daten:
      
👥 ${data?.firstName} ${data?.lastName}
📅 ${data?.birthDate}
🏫 ${data?.school}, Klasse ${data?.grade}
📍 Stadt: ${data?.city}
🏠 Bezirk: ${data?.district}

📜 Scout-Kodex:
1. Ich verspreche, ehrlich zu sein.
2. Ich kümmere mich um meine Stadt.
3. Ich helfe anderen.

Stimmst du zu und sind die Daten korrekt?`,
            Markup.inlineKeyboard([
                Markup.button.callback("✅ Ja, registrieren", "agree_code"),
                Markup.button.callback("❌ Nein, neu starten", "restart_onboarding")
            ])
        );
        return ctx.wizard.next();
    },
    // Step 8: Save to DB
    async (ctx) => {
        // @ts-ignore
        const callbackData = ctx.callbackQuery?.data;

        if (callbackData === "restart_onboarding") {
            await ctx.answerCbQuery("Wir starten von vorne...");
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
                    } as any
                });

                // Update context user
                ctx.user = updatedUser;

                // Send to Master Bot (System Core) using MessengerHub
                const adminChatId = process.env.ADMIN_CHAT_ID;
                if (adminChatId) {
                    const adminMsg = `🆕 **Neue SCOUT-Bewerbung!**\n\n👤 ${updatedUser.firstName} ${updatedUser.lastName}\n🏙️ ${(updatedUser as any).city} | 🏫 ${updatedUser.school}\n👤 ID: ${updatedUser.id}\n\nWählen Sie eine Aktion im Master Bot:`;
                    await messengerHub.sendToMaster(Number(adminChatId), adminMsg, {
                        reply_markup: Markup.inlineKeyboard([
                            [Markup.button.callback("✅ Genehmigen", `approve_user_${updatedUser.id}`)],
                            [Markup.button.callback("❌ Ablehnen", `reject_user_${updatedUser.id}`)]
                        ]).reply_markup
                    });
                }
            }

            await ctx.reply("🚀 Dein Profil wurde zur Moderation an **System Core** gesendet.\n\nSobald es genehmigt wird, erhältst du eine Benachrichtigung und kannst deine erste Mission starten!");
            return ctx.scene.leave();
        } else {
            // If user typed something instead of clicking button
            await ctx.reply("Bitte drücke die Taste.");
            return;
        }
    }
);
