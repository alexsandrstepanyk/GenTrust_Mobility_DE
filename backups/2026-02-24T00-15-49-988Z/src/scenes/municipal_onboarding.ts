import { Scenes, Markup } from "telegraf";
import prisma from "../services/prisma";
import { messengerHub } from "../services/messenger";

export const municipalOnboardingScene = new Scenes.WizardScene(
    "municipal_onboarding",
    // Schritt 1: Name
    async (ctx) => {
        await ctx.reply("👋 Wie heißen Sie? (Vor- und Nachname)");
        return ctx.wizard.next();
    },
    // Schritt 2: Telefon
    async (ctx) => {
        if (!ctx.message || !("text" in ctx.message)) {
            return ctx.reply("❌ Bitte geben Sie Ihren Namen als Text ein.");
        }

        const fullName = ctx.message.text.trim();
        const [firstName, ...lastNameParts] = fullName.split(" ");

        (ctx.wizard.state as any).firstName = firstName;
        (ctx.wizard.state as any).lastName = lastNameParts.join(" ");

        await ctx.reply("📞 Geben Sie Ihre Telefonnummer ein:");
        return ctx.wizard.next();
    },
    // Schritt 3: Abteilung
    async (ctx) => {
        if (!ctx.message || !("text" in ctx.message)) {
            return ctx.reply("❌ Bitte geben Sie die Telefonnummer ein.");
        }

        (ctx.wizard.state as any).phone = ctx.message.text.trim();

        await ctx.reply("🏢 Wählen Sie Ihre Abteilung:", Markup.inlineKeyboard([
            [Markup.button.callback("🚧 Straßen", "dept_roads")],
            [Markup.button.callback("🗑️ Müll", "dept_waste")],
            [Markup.button.callback("💡 Beleuchtung", "dept_lighting")],
            [Markup.button.callback("🌳 Parks", "dept_parks")],
            [Markup.button.callback("🏗️ Sonstiges", "dept_other")]
        ]));

        return ctx.wizard.next();
    },
    // Schritt 4: Speichern
    async (ctx) => {
        if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
            return ctx.reply("❌ Bitte wählen Sie die Abteilung über die Buttons.");
        }

        const departmentMap: { [key: string]: string } = {
            "dept_roads": "Straßen",
            "dept_waste": "Müll",
            "dept_lighting": "Beleuchtung",
            "dept_parks": "Parks",
            "dept_other": "Sonstiges"
        };

        const department = departmentMap[ctx.callbackQuery.data];
        const state = ctx.wizard.state as any;

        try {
            // Mitarbeiter erstellen
            const worker = await (prisma as any).municipalWorker.create({
                data: {
                    telegramId: BigInt(ctx.from!.id),
                    firstName: state.firstName,
                    lastName: state.lastName,
                    phone: state.phone,
                    department: department,
                    status: "PENDING"
                }
            });

            // Antrag zur Genehmigung an City Hall Bot senden
            const adminChatId = process.env.ADMIN_CHAT_ID;
            if (adminChatId) {
                const adminMsg = `🏗️ **Neue Bewerbung für den KOMMUNALDIENST!**\n\n👤 ${worker.firstName} ${worker.lastName || ""}\n📞 ${worker.phone}\n🏢 Abteilung: ${worker.department}\n👤 ID: ${worker.id}\n\nWählen Sie eine Aktion:`;

                try {
                    const ok = await messengerHub.sendToAdmin(Number(adminChatId), adminMsg, {
                        reply_markup: Markup.inlineKeyboard([
                            [Markup.button.callback("✅ Genehmigen", `approve_municipal_${worker.id}`)],
                            [Markup.button.callback("❌ Ablehnen", `reject_municipal_${worker.id}`)]
                        ]).reply_markup
                    });

                    console.log(`[Municipal Onboarding] Notification to admin ${adminChatId} sent: ${ok}`);

                    if (!ok) {
                        console.warn(`[Municipal Onboarding] sendToAdmin failed, trying Master Bot fallback`);
                        const fallbackOk = await messengerHub.sendToMaster(Number(adminChatId), adminMsg, {
                            reply_markup: Markup.inlineKeyboard([
                                [Markup.button.callback("✅ Genehmigen", `approve_municipal_${worker.id}`)],
                                [Markup.button.callback("❌ Ablehnen", `reject_municipal_${worker.id}`)]
                            ]).reply_markup
                        });
                        console.log(`[Municipal Onboarding] Fallback to Master Bot sent: ${fallbackOk}`);
                    }
                } catch (err) {
                    console.error("[Municipal Onboarding] Failed to notify admin:", err);
                }
            }

            await ctx.answerCbQuery();
            await ctx.reply(
                `✅ Danke für die Registrierung!\n\n` +
                `👤 ${state.firstName} ${state.lastName || ""}\n` +
                `📞 ${state.phone}\n` +
                `🏢 Abteilung: ${department}\n\n` +
                `⏳ Ihr Antrag wurde zur Prüfung gesendet. Bitte warten Sie auf die Genehmigung durch den Administrator.`
            );

            return ctx.scene.leave();
        } catch (error) {
            console.error("[Municipal Onboarding] Error:", error);
            await ctx.reply("❌ Fehler bei der Registrierung. Bitte versuchen Sie es später erneut.");
            return ctx.scene.leave();
        }
    }
);
